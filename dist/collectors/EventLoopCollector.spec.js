"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventLoopCollector_1 = require("./EventLoopCollector");
const Config_1 = require("./../core/Config");
describe('EventLoopCollector', () => {
    let collector;
    let config;
    beforeEach(() => {
        config = new Config_1.Config({ eventLoopThreshold: 100 });
        collector = new EventLoopCollector_1.EventLoopCollector(config);
    });
    afterEach(async () => {
        await collector.stop();
    });
    /**
     * Test: Collector initialization
     * - Verifies interval creation
     * - Checks initial state
     * - Ensures proper startup
     */
    it('should initialize correctly', async () => {
        await collector.start();
        expect(collector['isRunning']).toBe(true); //Collector should be running after start
        expect(collector['checkInterval']).toBeDefined(); //Should create check interval
        await collector.stop();
        expect(collector['checkInterval']).toBeUndefined(); //Should clear interval on stop
    });
    /**
     * Test: Lag measurement
     * - Verifies lag calculation
     * - Tests threshold detection
     * - Ensures accurate timing
     */
    it('should measure event loop lag', async () => {
        await collector.start();
        // Simulate some lag
        await new Promise(resolve => setTimeout(resolve, 50));
        const metrics = await collector.collect();
        expect(metrics).toHaveLength(1); //Should return single lag metric
        const lagMetric = metrics[0];
        expect(lagMetric.name).toBe('eventloop.lag'); //Should use correct metric name
        expect(typeof lagMetric.value).toBe('number'); //Lag value should be numeric
        expect(lagMetric.metadata?.unit).toBe('milliseconds'); //Should use milliseconds as unit
    });
    /**
     * Test: Status detection
     * - Verifies threshold-based status
     * - Tests normal and warning states
     * - Ensures proper metadata
     */
    it('should detect lag status correctly', async () => {
        await collector.start();
        // Force lag by blocking the event loop
        const blockLoop = (ms) => {
            const start = Date.now();
            while (Date.now() - start < ms) {
                // Block event loop
            }
        };
        // Test normal status
        let metrics = await collector.collect();
        expect(metrics[0].metadata?.status).toBe('normal'); //Should report normal status for low lag
        // Test warning status
        blockLoop(150); // Exceed threshold
        metrics = await collector.collect();
        expect(metrics[0].metadata?.status).toBe('warning'); //Should report warning status for high lag
    });
    /**
     * Test: Error handling
     * - Verifies collection state validation
     * - Tests error conditions
     * - Ensures proper cleanup
     */
    it('should handle errors appropriately', async () => {
        await expect(collector.collect()).rejects.toThrow('Collector must be started before collecting metrics');
        await collector.start();
        await collector.stop();
        await expect(collector.collect()).rejects.toThrow('Collector must be started before collecting metrics');
    });
});
