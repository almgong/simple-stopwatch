/**
 * Manages callbacks registered to a StopWatch instance.
 */
export default class OnTickManager {
  callbackStorage: object;

  constructor() {
    this.callbackStorage = {};
  }

  /**
   * Register a callback to be invoked every X seconds.
   * @param {Function} callback            a function handle
   * @param {number}   resolutionInSeconds resolution
   */
  register(callback: Function, resolutionInSeconds: number) {
    if (this.callbackStorage[resolutionInSeconds] === undefined) {
      this.callbackStorage[resolutionInSeconds] = {
        callbacks: [],
        remainingSecondsBeforeNextInvocation: resolutionInSeconds
      };
    }

    this.callbackStorage[resolutionInSeconds].callbacks.push(callback);
  }

  /**
   * Unregister all instances of a specified callback, if any.
   * @param {Function} callback the function registered in a call to register()
   */
  unregister(callback: Function) {
    // scan through all registered callbacks to remove the specified one
    Object.keys(this.callbackStorage).forEach((resolutionInSeconds) => {
      const callbacks = this.callbackStorage[resolutionInSeconds].callbacks;
      let index;
      while((index = callbacks.indexOf(callback)) !== -1) {
        callbacks.splice(index, 1);
      }
    });
  }

  /**
   * Hook for Stopwatch to call when a second has elapsed
   */
  onSecondElapsed() {
    Object.keys(this.callbackStorage).forEach((resolutionInSeconds) => {
      this.callbackStorage[resolutionInSeconds].remainingSecondsBeforeNextInvocation -= 1;

      // if it's time, invoke all the callbacks
      if (this.callbackStorage[resolutionInSeconds].remainingSecondsBeforeNextInvocation <= 0) {
        this.callbackStorage[resolutionInSeconds].callbacks.forEach((cb) => { cb() });
        this.callbackStorage[resolutionInSeconds].remainingSecondsBeforeNextInvocation = resolutionInSeconds;        
      }
    });
  }
}