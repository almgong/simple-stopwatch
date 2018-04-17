import OnTickManager from './OnTickManager';

enum STOPWATCH_STATE {
  IDLE,
  RUNNING,
  STOPPED
};

/**
 * A timing utility exposing functionality similar to a traditional stopwatch.
 */
export default class Stopwatch {
  currentStartTime: number;       // milliseconds since the last start() was called
  laps: Array<number>;            // array of recorded laps
  lastSecondElapsed: number;      // the last time that a second passed, used to compute next timeout delay
  onTickManager: OnTickManager;   // manages callbacks registered
  state: number;                  // one of STOPWATCH_STATE.[IDLE|RUNNING|STOPPED]
  stoppedTimeOffset: number;      // for use in calculating total elapsed time when stop()s occur
  timeoutRef: number;             // handle for window.setTimeout()

  constructor() {
    this.reset();
  }

  /**
   * Returns an array with the collected lap times triggered by
   * calls to lap().
   * @return {Array<number>} the recorded laps
   */
  getLaps() : Array<number> {
    return this.laps;
  }

  /**
   * Returns the total elapsed time in milliseconds since start() was first called.
   * Respects calls to stop().
   * @return {number} the total elapsed time recorded by this stopwatch instance
   */
  getTotalElapsedTime() : number {
    let elapsedTime = this.stoppedTimeOffset;

    if (this.state === STOPWATCH_STATE.RUNNING) {
      elapsedTime += (Date.now() - this.currentStartTime); 
    }

    return elapsedTime;
  }

  /**
   * Records the current lap in units of milliseconds, readying the stopwatch to record the next.
   * @return {number} the recorded lap in units of milliseconds.
   */
  lap() : number {
    const now = Date.now();
    const previousLapTime = this.laps.reduce((acc, val) => (acc + val), 0);
    const newLap = now - previousLapTime - this.currentStartTime;

    this.laps.push(newLap);

    return newLap;
  }

  /**
   * Unregisters all instances of a callback from the stopwatch.
   * @param {Function} cb [description]
   */
  offTick(cb: Function) {
    this.onTickManager.unregister(cb);
  }

  /**
   * Registers a callback to be invoked every X seconds. Note that callbacks
   * with the same resolution time in seconds will be synchronized with each other.
   * That is, if you specify one callback to be called every 10 seconds, and then another callback
   * 2 seconds later on the same cadence, both will be then be invoked next in 8 seconds.
   * @param {Function} cb                  the callback to invoke
   * @param {number}   resolutionInSeconds frequency to which cb is invoked, in units of seconds
   */
  onTick(cb: Function, resolutionInSeconds: number) {
    this.onTickManager.register(cb, resolutionInSeconds);
  }

  /**
   * Starts/Resumes the stopwatch.
   */
  start() {
    const now = Date.now();
    this.currentStartTime = now;
    this.lastSecondElapsed = now;
    this.timeoutRef = window.setTimeout(this._onSecondElapsed.bind(this), 1000);
    this.state = STOPWATCH_STATE.RUNNING;
  }

  /**
   * Pauses the stopwatch.
   */
  stop() {
    // aggregate the time elapsed and reset current timer
    const now = Date.now();
    const timeElapsed = now - this.currentStartTime;
    this.stoppedTimeOffset += timeElapsed;
    this.state = STOPWATCH_STATE.STOPPED;

    window.clearTimeout(this.timeoutRef);
  }

  /**
   * Resets the stopwatch, putting it in an idle state and ready
   * for the next start().
   */
  reset() {
    if (this.timeoutRef !== null) {
      window.clearTimeout(this.timeoutRef);
    }

    this.currentStartTime = null;
    this.laps = [];
    this.lastSecondElapsed = null;
    this.onTickManager = new OnTickManager();
    this.state = STOPWATCH_STATE.IDLE;
    this.stoppedTimeOffset = 0;
    this.timeoutRef = null;
  }

  _onSecondElapsed() {
    this.onTickManager.onSecondElapsed();

    const now = Date.now();
    const error = now - this.lastSecondElapsed - 1000;

    this.lastSecondElapsed = now;
    this.timeoutRef = window.setTimeout(this._onSecondElapsed.bind(this), 1000 - error);
  }
}