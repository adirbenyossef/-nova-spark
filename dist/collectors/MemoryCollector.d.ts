import { Collector, Metric } from '../core/Collector';
import { Config } from '../core/Config';
/**
 * Collects memory usage metrics from the Node.js process.
 *
 * The MemoryCollector monitors heap usage, memory growth, and potential
 * memory leaks by tracking memory usage patterns over time.
 *
 * @implements {Collector}
 *
 * @example
 * ```typescript
 * const config = new Config({ maxMemorySnapshots: 10 });
 * const collector = new MemoryCollector(config);
 *
 * await collector.start();
 * const metrics = await collector.collect();
 * await collector.stop();
 * ```
 */
export declare class MemoryCollector implements Collector {
    private readonly config;
    private readonly snapshots;
    private isRunning;
    /**
     * Creates a new MemoryCollector instance.
     *
     * @param {Config} config - Configuration for the collector
     */
    constructor(config: Config);
    /**
     * Initializes the memory collector.
     *
     * Resets snapshot history and prepares for collection.
     *
     * @returns {Promise<void>} Resolves when initialization is complete
     */
    start(): Promise<void>;
    /**
     * Stops the memory collector.
     *
     * Cleans up snapshot history and stops monitoring.
     *
     * @returns {Promise<void>} Resolves when cleanup is complete
     */
    stop(): Promise<void>;
    /**
     * Collects memory usage metrics.
     *
     * Gathers heap usage statistics and calculates memory growth rate
     * to help identify potential memory leaks.
     *
     * @returns {Promise<Metric[]>} Array of memory-related metrics
     * @throws {Error} If collection is attempted while collector is not running
     *
     * @example
     * Returned metrics format:
     * ```typescript
     * [
     *   {
     *     name: 'memory.heapUsed',
     *     value: 1234567,  // bytes
     *     timestamp: 1234567890,
     *     type: 'memory',
     *     metadata: { unit: 'bytes' }
     *   },
     *   // ... other memory metrics
     * ]
     * ```
     */
    collect(): Promise<Metric[]>;
    /**
     * Calculates the memory growth rate based on snapshot history.
     *
     * @private
     * @returns {number} Average memory growth rate in bytes per snapshot
     */
    private calculateGrowthRate;
    /**
     * Determines memory status based on growth rate.
     *
     * @private
     * @param {number} growthRate - Current memory growth rate
     * @returns {'normal' | 'warning'} Status indicator
     */
    private determineMemoryStatus;
}
