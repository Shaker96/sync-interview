/** Unix time in whole seconds. */
export interface Clock {
  now(): number;
}

export const systemClock: Clock = {
  now: () => Math.floor(Date.now() / 1000),
};

/** A clock the tests move by hand. */
export class TestClock implements Clock {
  constructor(private seconds = 1_000_000) {}

  now(): number {
    return this.seconds;
  }

  set(seconds: number): void {
    this.seconds = seconds;
  }

  advance(seconds: number): void {
    this.seconds += seconds;
  }
}
