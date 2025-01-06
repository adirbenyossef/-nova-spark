import { Collector, Metric } from '../core/Collector';
import { Config } from '../core/Config';

/**
 * Collects event loop lag metrics from the Node.js process.
 * 
 * The EventLoopCollector monitors the delay between scheduled and actual
 * execution times in the event loop, helping identify performance bottlenecks
 * and blocking operations.
 * 
 * @implements {Collector}
 * 
 * @example
 * ```typescript
 * const config = new Config({ eventLoopThreshold: 100 });
 * const collector = new EventLoopCollector(config);
 * 
 * await collector.start();
 * const metrics = await collector.collect();
 * await collector.stop();
 * ```
 */
export class EventLoopCollector implements Collector {
  private readonly config: Config;
  private isRunning: boolean;
  private lastLoopTime: number;
  private checkInterval?: NodeJS.Timeout;

  /**
   * Creates a new EventLoopCollector instance.
   * 
   * @param {Config} config - Configuration for the collector
   */
  constructor(config: Config) {
    this.config = config;
    this.isRunning = false;
    this.lastLoopTime = Date.now();
  }

  /**
   * Initializes the event loop collector.
   * 
   * Sets up the initial timestamp and starts monitoring
   * event loop lag.
   * 
   * @returns {Promise<void>} Resolves when initialization is complete
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.lastLoopTime = Date.now();
    this.isRunning = true;

    // Set up a high-resolution interval to detect event loop lag
    this.checkInterval = setInterval(() => {
      this.lastLoopTime = Date.now();
    }, 1);
  }

  /**
   * Stops the event loop collector.
   * 
   * Cleans up resources and stops monitoring.
   * 
   * @returns {Promise<void>} Resolves when cleanup is complete
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }

    this.isRunning = false;
  }

  /**
   * Collects event loop lag metrics.
   * 
   * Measures the delay between scheduled and actual execution times
   * to determine event loop lag.
   * 
   * @returns {Promise<Metric[]>} Array containing event loop lag metric
   * @throws {Error} If collection is attempted while collector is not running
   * 
   * @example
   * Returned metrics format:
   * ```typescript
   * [
   *   {
   *     name: 'eventloop.lag',
   *     value: 5,  // milliseconds
   *     timestamp: 1234567890,
   *     type: 'eventloop',
   *     metadata: {
   *       unit: 'milliseconds',
   *       threshold: 100,
   *       status: 'normal'
   *     }
   *   }
   * ]
   * ```
   */
  async collect(): Promise<Metric[]> {
    if (!this.isRunning) {
      throw new Error('Collector must be started before collecting metrics');
    }

    const currentTime = Date.now();
    const lag = currentTime - this.lastLoopTime;
    this.lastLoopTime = currentTime;

    // Determine lag status based on threshold
    const status = lag > this.config.eventLoopThreshold ? 'warning' : 'normal';

    return [{
      name: 'eventloop.lag',
      value: lag,
      timestamp: currentTime,
      type: 'eventloop',
      metadata: {
        unit: 'milliseconds',
        threshold: this.config.eventLoopThreshold,
        status
      }
    }];
  }
} 