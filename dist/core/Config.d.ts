/**
 * Configuration options for the Spark monitoring system.
 *
 * This interface defines all configurable parameters that can be passed
 * to customize the behavior of the monitoring system.
 *
 * @interface SparkConfig
 *
 * @example
 * ```typescript
 * const config: SparkConfig = {
 *   sampleInterval: 1000,
 *   enabled: true,
 *   maxMemorySnapshots: 20,
 *   debugMode: true
 * };
 * ```
 */
export interface SparkConfig {
    /**
     * The interval between metric collections in milliseconds.
     * Determines how frequently metrics are gathered.
     * @default 5000
     */
    sampleInterval?: number;
    /**
     * Whether the monitoring system is active.
     * Can be used to temporarily disable monitoring.
     * @default true
     */
    enabled?: boolean;
    /**
     * Maximum number of memory snapshots to retain.
     * Used for memory leak detection and trend analysis.
     * @default 10
     */
    maxMemorySnapshots?: number;
    /**
     * Duration of CPU profiling samples in milliseconds.
     * Longer durations provide more accurate CPU usage data
     * but may impact performance.
     * @default 500
     */
    cpuProfilingDuration?: number;
    /**
     * Threshold in milliseconds for event loop lag warnings.
     * Lag exceeding this value triggers warnings.
     * @default 100
     */
    eventLoopThreshold?: number;
    /**
     * Maximum number of metrics to buffer before emission.
     * Controls memory usage and network payload size.
     * @default 1000
     */
    metricsBufferSize?: number;
    /**
     * Enables detailed logging for debugging purposes.
     * @default false
     */
    debugMode?: boolean;
}
/**
 * Configuration class that manages and validates monitoring settings.
 *
 * This class provides a type-safe way to manage configuration options
 * with sensible defaults and validation.
 *
 * @class Config
 *
 * @example
 * ```typescript
 * // Create with defaults
 * const config = new Config();
 *
 * // Create with custom options
 * const config = new Config({
 *   sampleInterval: 1000,
 *   maxMemorySnapshots: 20
 * });
 * ```
 */
export declare class Config {
    /**
     * Interval between metric collections in milliseconds
     * @readonly
     */
    readonly sampleInterval: number;
    /**
     * Whether the monitoring system is active
     * @readonly
     */
    readonly enabled: boolean;
    /**
     * Maximum number of memory snapshots to retain
     * @readonly
     */
    readonly maxMemorySnapshots: number;
    /**
     * Duration of CPU profiling samples in milliseconds
     * @readonly
     */
    readonly cpuProfilingDuration: number;
    /**
     * Threshold for event loop lag warnings in milliseconds
     * @readonly
     */
    readonly eventLoopThreshold: number;
    /**
     * Maximum number of metrics to buffer before emission
     * @readonly
     */
    readonly metricsBufferSize: number;
    /**
     * Whether debug mode is enabled
     * @readonly
     */
    readonly debugMode: boolean;
    /**
     * Creates a new Config instance.
     *
     * Initializes configuration with provided values or defaults.
     * All properties are made readonly to prevent modification after creation.
     *
     * @param {SparkConfig} [config] - Optional configuration options
     * @throws {Error} If any configuration values are invalid
     *
     * @example
     * ```typescript
     * // With defaults
     * const config = new Config();
     *
     * // With custom values
     * const config = new Config({
     *   sampleInterval: 1000,
     *   enabled: true
     * });
     * ```
     */
    constructor(config?: SparkConfig);
    /**
     * Validates the configuration values.
     *
     * Ensures all numeric values are positive and within acceptable ranges.
     *
     * @private
     * @throws {Error} If any configuration values are invalid
     */
    private validateConfig;
}
