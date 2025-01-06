"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config_1 = require("./Config");
describe('Config', () => {
    /**
     * Test: Default configuration values
     * - Creates config with no parameters
     * - Verifies all defaults are set correctly
     * - Ensures readonly properties are properly set
     */
    it('should initialize with correct default values', () => {
        const config = new Config_1.Config();
        expect(config.sampleInterval).toBe(5000); //Default sample interval should be 5000ms
        expect(config.enabled).toBe(true); //Monitoring should be enabled by default
        expect(config.maxMemorySnapshots).toBe(10); //Should retain 10 memory snapshots by default
        expect(config.cpuProfilingDuration).toBe(500); //CPU profiling duration should default to 500ms
        expect(config.eventLoopThreshold).toBe(100); //Event loop threshold should default to 100ms
        expect(config.metricsBufferSize).toBe(1000); //Metrics buffer size should default to 1000
        expect(config.debugMode).toBe(false); //Debug mode should be disabled by default
    });
    /**
     * Test: Custom configuration override
     * - Creates config with custom values
     * - Verifies custom values are applied
     * - Confirms unspecified values use defaults
     */
    it('should override defaults with provided values', () => {
        const config = new Config_1.Config({
            sampleInterval: 1000,
            debugMode: true,
            maxMemorySnapshots: 20
        });
        expect(config.sampleInterval).toBe(1000); //Custom sample interval should be applied
        expect(config.debugMode).toBe(true); //Debug mode should be enabled when specified
        expect(config.maxMemorySnapshots).toBe(20); //Custom memory snapshot limit should be applied
        expect(config.enabled).toBe(true); //Unspecified values should use defaults
    });
    /**
     * Test: Configuration validation
     * - Attempts to create configs with invalid values
     * - Verifies appropriate error messages
     * - Ensures type safety
     */
    describe('validation', () => {
        it('should reject negative sample interval', () => {
            expect(() => new Config_1.Config({ sampleInterval: -1 }))
                .toThrow('sampleInterval must be greater than 0');
        });
        it('should reject zero memory snapshots', () => {
            expect(() => new Config_1.Config({ maxMemorySnapshots: 0 }))
                .toThrow('maxMemorySnapshots must be greater than 0');
        });
        it('should reject negative CPU profiling duration', () => {
            expect(() => new Config_1.Config({ cpuProfilingDuration: -100 }))
                .toThrow('cpuProfilingDuration must be greater than 0');
        });
        it('should reject invalid event loop threshold', () => {
            expect(() => new Config_1.Config({ eventLoopThreshold: 0 }))
                .toThrow('eventLoopThreshold must be greater than 0');
        });
        it('should reject invalid metrics buffer size', () => {
            expect(() => new Config_1.Config({ metricsBufferSize: -1 }))
                .toThrow('metricsBufferSize must be greater than 0');
        });
    });
    /**
     * Test: Configuration immutability
     * - Attempts to modify config properties
     * - Verifies properties are readonly
     * - Ensures configuration integrity
     */
    it('should prevent modification of config properties', () => {
        const config = new Config_1.Config();
        expect(() => {
            config.sampleInterval = 1000;
        }).toThrow(TypeError); //Config properties should be readonly
        expect(() => {
            config.enabled = false;
        }).toThrow(TypeError); //Config properties should be readonly
    });
});
