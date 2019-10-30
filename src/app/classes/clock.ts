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
    var self = this;
    this.timer = setInterval(function() { self.tick(self); }, 2);
    this.last = new Date().getTime();
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  public tick(self) {
    if (!self.heartbeat) return;
    var now = new Date().getTime();
    while (now - self.last >= self.heartbeat) {
      self.ticks++;
      if (self.message) {
        self.queueInterrupt(function(memory, registers, state, hardware) {
          registers.A = self.message;
        });
      }
      self.last += self.heartbeat;
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
