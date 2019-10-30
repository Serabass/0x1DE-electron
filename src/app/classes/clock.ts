// Generic Clock (compatible)

export class Clock {
  public type = 0x12d0b402;
  public revision = 1;
  public manufacturer = 0x904b3115;

  public SET_FREQUENCY = 0;
  public GET_TICKS = 1;
  public SET_INT = 2;

  public ticks;
  public heartbeat;
  public queueInterrupt;
  public timer;
  public last;
  public message;

  public reset(queueInterrupt?) {
    if (queueInterrupt) {
      this.queueInterrupt = queueInterrupt;
    }
    // heartbeat: # of msec between clock ticks
    this.heartbeat = 0;
    this.ticks = 0;
  }

  public start() {
    this.stop();
    this.timer = setInterval(() => {
      this.tick();
    }, 2);
    this.last = new Date().getTime();
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  public tick() {
    if (!this.heartbeat) return;
    var now = new Date().getTime();
    while (now - this.last >= this.heartbeat) {
      this.ticks++;
      if (this.message) {
        this.queueInterrupt((memory, registers, state, hardware) => {
          registers.A = this.message;
        });
      }
      this.last += this.heartbeat;
    }
  }

  public interrupt(memory, registers) {
    switch (registers.A) {
      case this.SET_FREQUENCY: {
        this.reset();
        this.heartbeat = 100 * registers.B / 6;
        break;
      }
      case this.GET_TICKS: {
        registers.C = this.ticks;
        break;
      }
      case this.SET_INT: {
        this.message = registers.B;
        break;
      }
    }
    return 0;
  }
}
