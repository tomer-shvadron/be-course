type AlertHandler = (message: string) => void;

const defaultAlertHandler: AlertHandler = (message: string) => {
  console.log(`ALERT: ${message}`);
};

export class Monitor {
  private failureTimestamps: number[] = [];
  private readonly failureThreshold: number;
  private readonly windowSizeSeconds: number;
  private readonly alertHandler: AlertHandler;

  constructor(
    failureThreshold: number = 3,
    windowSizeSeconds: number = 60,
    alertHandler: AlertHandler = defaultAlertHandler
  ) {
    this.failureThreshold = failureThreshold;
    this.windowSizeSeconds = Math.max(60, windowSizeSeconds); // Ensure minimum 60 seconds
    this.alertHandler = alertHandler;
  }

  /**
   * Call this method when an action succeeds
   */
  pass(): void {
    this.failureTimestamps = [];
  }

  /**
   * Call this method when an action fails
   * Raises an alert after K consecutive failures within the moving window
   */
  fail(now: number = Date.now()): void {
    const windowStart = now - this.windowSizeSeconds * 1000;

    // Add current failure timestamp
    this.failureTimestamps.push(now);

    if (this.failureTimestamps.length >= this.failureThreshold) {
      const isWithinWindow =
        this.failureTimestamps[
          this.failureTimestamps.length - this.failureThreshold
        ] >= windowStart;

      if (isWithinWindow) {
        // Remove failures outside the moving window
        this.failureTimestamps = this.failureTimestamps.filter(
          (timestamp) => timestamp >= windowStart
        );

        this.alertHandler(
          `Detected ${this.failureTimestamps.length} failures within ${this.windowSizeSeconds} seconds`
        );
      }
    }
  }
}
