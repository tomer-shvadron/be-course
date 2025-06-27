type AlertHandler = (message: string) => void;

const defaultAlertHandler: AlertHandler = (message: string) => {
  console.log(`ALERT: ${message}`);
};

export class Monitor {
  private consecutiveFailures: number = 0;
  private readonly failureThreshold: number;
  private readonly alertHandler: AlertHandler;

  constructor(
    failureThreshold: number = 3,
    alertHandler: AlertHandler = defaultAlertHandler
  ) {
    this.failureThreshold = failureThreshold;
    this.alertHandler = alertHandler;
  }

  /**
   * Call this method when an action succeeds
   */
  pass(): void {
    this.consecutiveFailures = 0;
  }

  /**
   * Call this method when an action fails
   * Raises an alert after K consecutive failures
   */
  fail(): void {
    this.consecutiveFailures++;

    if (this.consecutiveFailures >= this.failureThreshold) {
      this.alertHandler(
        `Detected ${this.consecutiveFailures} consecutive failures`
      );
    }
  }
}
