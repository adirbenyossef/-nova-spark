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
export declare class EventLoopCollector implements Collector {
    private readonly config;
    private isRunning;
    private lastLoopTime;
    private checkInterval?;
    /**
     * Creates a new EventLoopCollector instance.
     *
     * @param {Config} config - Configuration for the collector
     */
    constructor(config: Config);
    /**
     * Initializes the event loop collector.
     *
     * Sets up the initial timestamp and starts monitoring
     * event loop lag.
     *
     * @returns {Promise<void>} Resolves when initialization is complete
     */
    start(): Promise<void>;
    /**
     * Stops the event loop collector.
     *
     * Cleans up resources and stops monitoring.
     *
     * @returns {Promise<void>} Resolves when cleanup is complete
     */
    stop(): Promise<void>;
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
    collect(): Promise<Metric[]>;
}
