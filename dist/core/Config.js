"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
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
class Config {
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
    constructor(config = {}) {
        this.sampleInterval = config.sampleInterval ?? 5000;
        this.enabled = config.enabled ?? true;
        this.maxMemorySnapshots = config.maxMemorySnapshots ?? 10;
        this.cpuProfilingDuration = config.cpuProfilingDuration ?? 500;
        this.eventLoopThreshold = config.eventLoopThreshold ?? 100;
        this.metricsBufferSize = config.metricsBufferSize ?? 1000;
        this.debugMode = config.debugMode ?? false;
        // Make the object completely immutable
        Object.freeze(this);
        // Validate configuration
        this.validateConfig();
    }
    /**
     * Validates the configuration values.
     *
     * Ensures all numeric values are positive and within acceptable ranges.
     *
     * @private
     * @throws {Error} If any configuration values are invalid
     */
    validateConfig() {
        if (this.sampleInterval <= 0) {
            throw new Error('sampleInterval must be greater than 0');
        }
        if (this.maxMemorySnapshots <= 0) {
            throw new Error('maxMemorySnapshots must be greater than 0');
        }
        if (this.cpuProfilingDuration <= 0) {
            throw new Error('cpuProfilingDuration must be greater than 0');
        }
        if (this.eventLoopThreshold <= 0) {
            throw new Error('eventLoopThreshold must be greater than 0');
        }
        if (this.metricsBufferSize <= 0) {
            throw new Error('metricsBufferSize must be greater than 0');
        }
    }
}
exports.Config = Config;
