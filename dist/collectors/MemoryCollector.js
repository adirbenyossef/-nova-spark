"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCollector = void 0;
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
class MemoryCollector {
    /**
     * Creates a new MemoryCollector instance.
     *
     * @param {Config} config - Configuration for the collector
     */
    constructor(config) {
        this.config = config;
        this.snapshots = [];
        this.isRunning = false;
    }
    /**
     * Initializes the memory collector.
     *
     * Resets snapshot history and prepares for collection.
     *
     * @returns {Promise<void>} Resolves when initialization is complete
     */
    async start() {
        if (this.isRunning)
            return;
        this.snapshots.length = 0;
        this.isRunning = true;
    }
    /**
     * Stops the memory collector.
     *
     * Cleans up snapshot history and stops monitoring.
     *
     * @returns {Promise<void>} Resolves when cleanup is complete
     */
    async stop() {
        if (!this.isRunning)
            return;
        this.snapshots.length = 0;
        this.isRunning = false;
    }
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
    async collect() {
        if (!this.isRunning) {
            throw new Error('Collector must be started before collecting metrics');
        }
        const metrics = [];
        const memoryUsage = process.memoryUsage();
        const timestamp = Date.now();
        // Store heap used for leak detection
        this.snapshots.push(memoryUsage.heapUsed);
        if (this.snapshots.length > this.config.maxMemorySnapshots) {
            this.snapshots.shift();
        }
        // Calculate memory growth rate
        const growthRate = this.calculateGrowthRate();
        metrics.push({
            name: 'memory.heapUsed',
            value: memoryUsage.heapUsed,
            timestamp,
            type: 'memory',
            metadata: {
                unit: 'bytes',
                status: this.determineMemoryStatus(growthRate)
            }
        }, {
            name: 'memory.heapTotal',
            value: memoryUsage.heapTotal,
            timestamp,
            type: 'memory',
            metadata: { unit: 'bytes' }
        }, {
            name: 'memory.rss',
            value: memoryUsage.rss,
            timestamp,
            type: 'memory',
            metadata: { unit: 'bytes' }
        }, {
            name: 'memory.growthRate',
            value: growthRate,
            timestamp,
            type: 'memory',
            metadata: {
                unit: 'bytes/snapshot',
                snapshots: this.snapshots.length
            }
        });
        return metrics;
    }
    /**
     * Calculates the memory growth rate based on snapshot history.
     *
     * @private
     * @returns {number} Average memory growth rate in bytes per snapshot
     */
    calculateGrowthRate() {
        if (this.snapshots.length < 2)
            return 0;
        const recentSnapshots = this.snapshots.slice(-5);
        let totalGrowth = 0;
        for (let i = 1; i < recentSnapshots.length; i++) {
            totalGrowth += recentSnapshots[i] - recentSnapshots[i - 1];
        }
        return totalGrowth / (recentSnapshots.length - 1);
    }
    /**
     * Determines memory status based on growth rate.
     *
     * @private
     * @param {number} growthRate - Current memory growth rate
     * @returns {'normal' | 'warning'} Status indicator
     */
    determineMemoryStatus(growthRate) {
        // Consider it a warning if memory is consistently growing
        return growthRate > 1024 * 100 ? 'warning' : 'normal'; // Warning if growing > 100KB per snapshot
    }
}
exports.MemoryCollector = MemoryCollector;
