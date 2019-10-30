/*
 *  DCPU-16 Emulator Library
 *  by deNULL (me@denull.ru)
 */

export class Emulator {
  public regs = ["A", "B", "C", "X", "Y", "Z", "I", "J"];
  public cycles = 0;
  
  public extendSign(word) {
    if (word & 0x8000) {
      // negative
      return word | 0xffff0000;
    }
    return word;
  }

  /*
   * Retrieves required value from memory or some of registers
   * (no_change - don't perform any changes on SP)
   */
  public getValue(is_a, code, memory, registers, no_change?) {
    if (code < 0x8) {
      return registers[this.regs[code]] || 0;
    } else if (code < 0x10) {
      return memory[registers[this.regs[code - 0x8]] || 0] || 0;
    } else if (code < 0x18) {
      var nw = memory[registers.PC] || 0;
      registers.PC = (registers.PC + 1) & 0xffff;
      this.cycles++;
      return (
        memory[(nw + registers[this.regs[code - 0x10]] || 0) & 0xffff] || 0
      );
    } else if (code == 0x18) {
      // POP / PUSH
      if (is_a) {
        var v = memory[registers.SP || 0] || 0;
        if (!no_change) registers.SP = (registers.SP + 1) & 0xffff;
        return v;
      } else {
        var v = memory[(registers.SP - 1) & 0xffff] || 0;
        if (!no_change) registers.SP = (registers.SP - 1) & 0xffff;
        return v;
      }
    } else if (code == 0x19) {
      // PEEK
      return memory[registers.SP || 0] || 0;
    } else if (code == 0x1a) {
      // PICK n
      var nw = memory[registers.PC] || 0;
      registers.PC = (registers.PC + 1) & 0xffff;
      this.cycles++;
      return memory[(nw + registers.SP) & 0xffff] || 0;
    } else if (code == 0x1b) {
      return registers.SP || 0;
    } else if (code == 0x1c) {
      return registers.PC || 0;
    } else if (code == 0x1d) {
      return registers.EX || 0;
    } else if (code == 0x1e) {
      var nw = memory[registers.PC] || 0;
      this.cycles++;
      registers.PC = (registers.PC + 1) & 0xffff;
      return memory[nw] || 0;
    } else if (code == 0x1f) {
      var nw = memory[registers.PC] || 0;
      this.cycles++;
      registers.PC = (registers.PC + 1) & 0xffff;
      return nw;
    } else {
      return (code - 0x21) & 0xffff;
    }
  }
  
  /*
   * Sets new value to specified place
   * (registers - copy of registers before executing command, cur_registers - actual version of them)
   */
  setValue(code, value, memory, registers) {
    if (code < 0x8) {
      registers[this.regs[code]] = value;
    } else if (code < 0x10) {
      memory[registers[this.regs[code - 0x8]]] = value;
    } else if (code < 0x18) {
      var nw = memory[(registers.PC - 1) & 0xffff];
      memory[(nw + registers[this.regs[code - 0x10]]) & 0xffff] = value;
    } else if (code == 0x18) {
      // PUSH (POP can't be set)
      memory[registers.SP] = value;
    } else if (code == 0x19) {
      // PEEK
      memory[registers.SP] = value;
    } else if (code == 0x1a) {
      // PICK n
      var nw = memory[(registers.PC - 1) & 0xffff];
      memory[(nw + registers.SP) & 0xffff] = value;
    } else if (code == 0x1b) {
      registers.SP = value;
    } else if (code == 0x1c) {
      registers.PC = value;
    } else if (code == 0x1d) {
      registers.EX = value;
    } else if (code == 0x1e) {
      memory[memory[(registers.PC - 1) & 0xffff]] = value;
    }
  }
  public catchFire(memory, registers, state, hardware) {
    state.onFire = true;
  }
  public triggerQueuedInterrupt(memory, registers, state, hardware) {
    if (state.interruptQueue.length == 0) return false;
    var interrupt = state.interruptQueue.shift();
    if (registers.IA) {
      state.queueInterrupts = true;
      registers.SP = (registers.SP - 1) & 0xffff;
      memory[registers.SP] = registers.PC;
      registers.SP = (registers.SP - 1) & 0xffff;
      memory[registers.SP] = registers.A;
      registers.PC = registers.IA;
      interrupt(memory, registers, state, hardware);
    }
    return true;
  }
  
  /*
   * - interrupt is a function (accepting memory, registers, state & hardware as arguments)
   */
  queueInterrupt(memory, registers, state, hardware, interrupt) {
    state.interruptQueue.push(interrupt);
    if (state.interruptQueue.length > 256) {
      this.catchFire(memory, registers, state, hardware);
    }
  }

  /*
   *  Skips one command, without performing any changes to memory and/or registers
   */
  skip(memory, registers) {
    var op;
    var cycles = this.cycles;
    var skipped = 0;
    do {
      var cur = memory[registers.PC] || 0;
      op = cur & 0x1f;
      var aa = (cur >> 10) & 0x3f;
      var bb = (cur >> 5) & 0x1f;

      registers.PC = (registers.PC + 1) & 0xffff;
      this.getValue(false, bb, memory, registers, true);
      this.getValue(true, aa, memory, registers, true);
      skipped++;
    } while (op >= 0x10 && op <= 0x17);
    this.cycles = cycles;
    return skipped;
  }

  /*
   * Steps over the next command (at [PC])
   * memory - array of 65536 words, current state of memory
   * registers - object with fields A, B, C... containing current registers state
   * state - object with three fields: interruptQueue (array of functions, see queueInterrupt), queueInterrupts (bool) and onFire (bool)
   * hardware - array of objects with fields "type", "version", "manufacturer" and "interrupt" (a function with two params: memory and registers, returns number of additional cycles to take)
   */
  step(memory, registers, state, hardware) {
    // maybe there is a better place for this?
    if (!state.queueInterrupts) {
      this.triggerQueuedInterrupt(memory, registers, state, hardware);
    }

    var cur = memory[registers.PC] || 0;
    var op = cur & 0x1f;
    var aa = (cur >> 10) & 0x3f;
    var bb = (cur >> 5) & 0x1f;
    registers.PC = (registers.PC + 1) & 0xffff;
    this.cycles = state.onFire ? 10 : 0;

    // leads to very annoying step-through-BRK behavior
    //if (cur == 0x8b83) {
    //  return -1;
    //}

    if (op == 0x0) {
      switch (bb) {
        case 0x01: {
          // JSR
          var av = this.getValue(true, aa, memory, registers);
          registers.SP = (registers.SP - 1) & 0xffff;
          memory[registers.SP] = registers.PC;
          registers.PC = av;
          return this.cycles + 3;
        }
        // ...
        case 0x07: {
          // HCF
          this.catchFire(memory, registers, state, hardware);
          return this.cycles + 9;
        }
        case 0x08: {
          // INT
          var av = this.getValue(true, aa, memory, registers);
          this.queueInterrupt(memory, registers, state, hardware, function(
            memory,
            registers,
            state,
            hardware
          ) {
            registers.A = av;
          });
          return this.cycles + 4;
        }
        case 0x09: {
          // IAG
          this.getValue(true, aa, memory, registers);
          this.setValue(aa, registers.IA || 0, memory, registers);
          return this.cycles + 1;
        }
        case 0x0a: {
          // IAS
          registers.IA = this.getValue(true, aa, memory, registers);
          return this.cycles + 1;
        }
        case 0x0b: {
          // RFI
          state.queueInterrupts = false;
          registers.A = memory[registers.SP];
          registers.SP = (registers.SP + 1) & 0xffff;
          registers.PC = memory[registers.SP];
          registers.SP = (registers.SP + 1) & 0xffff;
          return this.cycles + 3;
        }
        case 0x0c: {
          // IAQ
          state.queueInterrupts = this.getValue(true, aa, memory, registers)
            ? true
            : false;
          return this.cycles + 2;
        }
        // ...
        case 0x10: {
          // HWN
          this.getValue(true, aa, memory, registers);
          this.setValue(aa, hardware.length, memory, registers);
          return this.cycles + 2;
        }
        case 0x11: {
          // HWQ
          var hw = hardware[this.getValue(true, aa, memory, registers)];
          registers.A = hw.type & 0xffff;
          registers.B = (hw.type >> 16) & 0xffff;
          registers.C = hw.revision;
          registers.X = hw.manufacturer & 0xffff;
          registers.Y = (hw.manufacturer >> 16) & 0xffff;
          return this.cycles + 4;
        }
        case 0x12: {
          // HWI
          var hw = hardware[this.getValue(true, aa, memory, registers)];
          return this.cycles + hw.interrupt(memory, registers);
        }
        default: {
          return 0;
        }
      }
    } else {
      var av = this.getValue(true, aa, memory, registers);
      var bv = this.getValue(false, bb, memory, registers);
      var v;
      switch (op) {
        case 0x01: {
          // SET
          v = av;
          this.cycles += 1;
          break;
        }
        case 0x02: {
          // ADD
          v = av + bv;
          registers.EX = (v >> 16) & 0xffff;
          this.cycles += 2;
          break;
        }
        case 0x03: {
          // SUB
          v = -av + bv;
          registers.EX = (v >> 16) & 0xffff;
          this.cycles += 2;
          break;
        }
        case 0x04: {
          // MUL
          v = av * bv;
          registers.EX = (v >> 16) & 0xffff;
          this.cycles += 2;
          break;
        }
        case 0x05: {
          // MLI
          v = this.extendSign(av) * this.extendSign(bv);
          registers.EX = (v >> 16) & 0xffff;
          this.cycles += 2;
          break;
        }
        case 0x06: {
          // DIV
          if (av == 0) {
            registers.EX = 0;
            v = 0;
          } else {
            v = bv / av;
            registers.EX = (v * 0x10000) & 0xffff;
          }
          this.cycles += 3;
          break;
        }
        case 0x07: {
          // DVI
          var av = this.extendSign(av);
          var bv = this.extendSign(bv);
          if (av == 0) {
            registers.EX = 0;
            v = 0;
          } else {
            v = bv / av;
            registers.EX = (v * 0x10000) & 0xffff;
          }
          this.cycles += 3;
          break;
        }
        case 0x08: {
          // MOD
          v = av == 0 ? 0 : bv % av;
          this.cycles += 3;
          break;
        }
        case 0x09: {
          // MDI
          var av = this.extendSign(av);
          var bv = this.extendSign(bv);
          v = av == 0 ? 0 : bv % av;
          this.cycles += 3;
          break;
        }
        case 0x0a: {
          // AND
          v = av & bv;
          this.cycles += 1;
          break;
        }
        case 0x0b: {
          // BOR
          v = av | bv;
          this.cycles += 1;
          break;
        }
        case 0x0c: {
          // XOR
          v = av ^ bv;
          this.cycles += 1;
          break;
        }
        case 0x0d: {
          // SHR
          registers.EX = ((bv << 16) >>> av) & 0xffff;
          v = bv >>> av;
          this.cycles += 2;
          break;
        }
        case 0x0e: {
          // ASR
          var bv = this.extendSign(bv);
          registers.EX = ((bv << 16) >> av) & 0xffff;
          v = bv >> av;
          this.cycles += 2;
          break;
        }
        case 0x0f: {
          // SHL
          registers.EX = ((bv << av) >> 16) & 0xffff;
          v = bv << av;
          this.cycles += 2;
          break;
        }
        case 0x10: {
          // IFB
          if ((bv & av) == 0) {
            return this.cycles + 2 + this.skip(memory, registers);
          }
          return this.cycles + 2;
        }
        case 0x11: {
          // IFC
          if ((bv & av) != 0) {
            return this.cycles + 2 + this.skip(memory, registers);
          }
          return this.cycles + 2;
        }
        case 0x12: {
          // IFE
          if (bv != av) {
            return this.cycles + 2 + this.skip(memory, registers);
          }
          return this.cycles + 2;
        }
        case 0x13: {
          // IFN
          if (bv == av) {
            return this.cycles + 2 + this.skip(memory, registers);
          }
          return this.cycles + 2;
        }
        case 0x14: {
          // IFG
          if (bv <= av) {
            return this.cycles + 2 + this.skip(memory, registers);
          }
          return this.cycles + 2;
        }
        case 0x15: {
          // IFA
          var av = this.extendSign(av);
          var bv = this.extendSign(bv);
          if (bv <= av) {
            return this.cycles + 2 + this.skip(memory, registers);
          }
          return this.cycles + 2;
        }
        case 0x16: {
          // IFL
          if (bv >= av) {
            return this.cycles + 2 + this.skip(memory, registers);
          }
          return this.cycles + 2;
        }
        case 0x17: {
          // IFU
          var av = this.extendSign(av);
          var bv = this.extendSign(bv);
          if (bv >= av) {
            return this.cycles + 2 + this.skip(memory, registers);
          }
          return this.cycles + 2;
        }

        // ...

        case 0x1a: {
          // ADX
          v = av + bv + registers.EX;
          registers.EX = (v >> 16) & 0xffff;
          this.cycles += 3;
          break;
        }
        case 0x1b: {
          // SBX
          v = -av + bv + registers.EX;
          registers.EX = (v >> 16) & 0xffff;
          this.cycles += 3;
          break;
        }
        case 0x1e: {
          // STI
          v = av;
          this.cycles += 2;
          break;
        }
        case 0x1f: {
          // STD
          v = av;
          this.cycles += 2;
          break;
        }
      }
      this.setValue(bb, v & 0xffff, memory, registers);
      switch (op) {
        case 0x1e: {
          // STI
          registers.I = (registers.I + 1) & 0xffff;
          registers.J = (registers.J + 1) & 0xffff;
          break;
        }
        case 0x1f: {
          // STD
          registers.I = (registers.I - 1) & 0xffff;
          registers.J = (registers.J - 1) & 0xffff;
          break;
        }
      }
      return this.cycles;
    }
  }
}
