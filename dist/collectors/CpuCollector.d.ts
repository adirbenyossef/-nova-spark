import { Collector, Metric } from '../core/Collector';
import { Config } from '../core/Config';
/**
 * Collects CPU usage metrics from the Node.js process.
 *
 * The CpuCollector monitors both user and system CPU time,
 * providing insights into process performance and resource utilization.
 *
 * @implements {Collector}
 *
 * @example
 * ```typescript
 * const config = new Config({ cpuProfilingDuration: 500 });
 * const collector = new CpuCollector(config);
 *
 * await collector.start();
 * const metrics = await collector.collect();
 * await collector.stop();
 * ```
 */
export declare class CpuCollector implements Collector {
    private readonly config;
    private isRunning;
    private lastUsage;
    private lastTimestamp;
    /**
     * Creates a new CpuCollector instance.
     *
     * @param {Config} config - Configuration for the collector
     */
    constructor(config: Config);
    /**
     * Initializes the CPU collector.
     *
     * Sets up initial CPU usage baseline for delta calculations.
     *
     * @returns {Promise<void>} Resolves when initialization is complete
     */
    start(): Promise<void>;
    /**
     * Stops the CPU collector.
     *
     * Cleans up resources and resets the collector state.
     *
     * @returns {Promise<void>} Resolves when cleanup is complete
     */
    stop(): Promise<void>;
    /**
     * Collects CPU usage metrics.
     *
     * Gathers CPU usage data over the configured profiling duration.
     * Returns metrics for both user and system CPU time.
     *
     * @returns {Promise<Metric[]>} Array of CPU usage metrics
     * @throws {Error} If collection is attempted while collector is not running
     *
     * @example
     * Returned metrics format:
     * ```typescript
     * [
     *   {
     *     name: 'cpu.user',
     *     value: 123456,  // microseconds
     *     timestamp: 1234567890,
     *     type: 'cpu',
     *     metadata: { unit: 'microseconds' }
     *   },
     *   {
     *     name: 'cpu.system',
     *     value: 78901,   // microseconds
     *     timestamp: 1234567890,
     *     type: 'cpu',
     *     metadata: { unit: 'microseconds' }
     *   }
     * ]
     * ```
     */
    collect(): Promise<Metric[]>;
}
