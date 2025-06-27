type AlertHandler = (message: string) => void;

const defaultAlertHandler: AlertHandler = (message: string) => {
  console.log(`ALERT: ${message}`);
};

export class Monitor {
  private attempts: Array<{ timestamp: number; isFailure: boolean }> = [];
  private readonly failurePercentageThreshold: number;
  private readonly windowSizeSeconds: number;
  private readonly alertHandler: AlertHandler;

  constructor(
    failurePercentageThreshold: number = 1.0,
    windowSizeSeconds: number = 60,
    alertHandler: AlertHandler = defaultAlertHandler
  ) {
    this.failurePercentageThreshold = Math.max(
      0,
      Math.min(100, failurePercentageThreshold)
    ); // Ensure 0-100 range
    this.windowSizeSeconds = Math.max(60, windowSizeSeconds); // Ensure minimum 60 seconds
    this.alertHandler = alertHandler;
  }

  /**
   * Call this method when an action succeeds
   */
  pass(now: number = Date.now()): void {
    this.attempts.push({ timestamp: now, isFailure: false });
  }

  /**
   * Call this method when an action fails
   * Raises an alert when failure percentage reaches the threshold within the moving window
   */
  fail(now: number = Date.now()): void {
    const windowStart = now - this.windowSizeSeconds * 1000;

    // Add current attempt
    this.attempts.push({ timestamp: now, isFailure: true });

    // Remove attempts outside the moving window
    this.attempts = this.attempts.filter(
      (attempt) => attempt.timestamp >= windowStart
    );

    // Calculate failure percentage within the window
    const totalAttempts = this.attempts.length;

    if (totalAttempts > 0) {
      const failureCount = this.attempts.filter(
        (attempt) => attempt.isFailure
      ).length;
      const failurePercentage = (failureCount / totalAttempts) * 100;

      // Check if failure percentage reaches or exceeds the threshold
      if (failurePercentage >= this.failurePercentageThreshold) {
        this.alertHandler(
          `Failure rate: ${failurePercentage.toFixed(2)}% (${failureCount}/${totalAttempts} failures) within ${this.windowSizeSeconds} seconds`
        );
      }
    }
  }
}
