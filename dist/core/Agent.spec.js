"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Agent_1 = require("./Agent");
describe('Agent', () => {
    let agent;
    /**
     * Mock collector implementation for testing
     */
    class MockCollector {
        constructor() {
            this.isStarted = false;
        }
        async start() {
            this.isStarted = true;
        }
        async stop() {
            this.isStarted = false;
        }
        async collect() {
            if (!this.isStarted)
                throw new Error('Collector not started');
            return [{
                    name: 'test.metric',
                    value: 100,
                    timestamp: Date.now(),
                    type: 'memory'
                }];
        }
    }
    beforeEach(() => {
        agent = new Agent_1.Agent({ sampleInterval: 100 });
    });
    afterEach(async () => {
        await agent.stop();
    });
    /**
     * Test: Collector registration
     * - Registers multiple collectors
     * - Verifies unique naming
     * - Ensures proper registration
     */
    it('should register collectors correctly', () => {
        const collector = new MockCollector();
        agent.registerCollector('test', collector);
        expect(() => {
            agent.registerCollector('test', collector);
        }).toThrow('Collector already exists');
    });
    /**
     * Test: Agent lifecycle
     * - Tests start/stop functionality
     * - Verifies collector state
     * - Ensures proper cleanup
     */
    it('should manage lifecycle correctly', async () => {
        const collector = new MockCollector();
        agent.registerCollector('test', collector);
        await agent.start();
        expect(agent['isRunning']).toBe(true); //Agent should be running after start
        await agent.stop();
        expect(agent['isRunning']).toBe(false); //Agent should not be running after stop
    });
    /**
     * Test: Metrics collection
     * - Verifies metrics emission
     * - Tests collection interval
     * - Ensures proper event handling
     */
    it('should collect and emit metrics', (done) => {
        const collector = new MockCollector();
        agent.registerCollector('test', collector);
        agent.on('metrics', (metrics) => {
            expect(metrics).toHaveLength(1); //Should collect metrics from registered collector
            expect(metrics[0].name).toBe('test.metric'); //Should receive correctly named metrics
            done();
        });
        agent.start();
    });
    /**
     * Test: Error handling
     * - Tests collector failures
     * - Verifies error events
     * - Ensures system stability
     */
    it('should handle collection errors', (done) => {
        const failingCollector = {
            start: async () => { },
            stop: async () => { },
            collect: async () => { throw new Error('Collection failed'); }
        };
        agent.registerCollector('failing', failingCollector);
        agent.on('error', (error) => {
            expect(error.message).toBe('Collection failed'); //Should emit collector errors
            done();
        });
        agent.start();
    });
    /**
     * Test: Configuration access
     * - Verifies config immutability
     * - Tests config access
     * - Ensures configuration integrity
     */
    it('should provide access to configuration', () => {
        const config = agent.getConfig();
        expect(config.sampleInterval).toBe(100); //Should return correct configuration values
        expect(() => {
            config.sampleInterval = 200;
        }).toThrow(TypeError); //Configuration should be immutable
    });
    /**
     * Test: Multiple start calls
     * - Verifies idempotent behavior of start
     * - Ensures collectors aren't started multiple times
     */
    it('should handle multiple start calls gracefully', async () => {
        const collector = new MockCollector();
        agent.registerCollector('test', collector);
        await agent.start();
        await agent.start(); // Second start should be ignored
        expect(agent['isRunning']).toBe(true);
    });
    /**
     * Test: Multiple stop calls
     * - Verifies idempotent behavior of stop
     * - Ensures proper cleanup
     */
    it('should handle multiple stop calls gracefully', async () => {
        const collector = new MockCollector();
        agent.registerCollector('test', collector);
        await agent.start();
        await agent.stop();
        await agent.stop(); // Second stop should be ignored
        expect(agent['isRunning']).toBe(false);
    });
    /**
     * Test: Collection with no collectors
     * - Verifies behavior with empty collector set
     * - Ensures proper metrics emission
     */
    it('should handle collection with no collectors', (done) => {
        agent.on('metrics', (metrics) => {
            expect(metrics).toHaveLength(0);
            done();
        });
        agent.start();
    });
    /**
     * Test: Multiple collector registration
     * - Tests registration of multiple collectors
     * - Verifies all collectors are called
     */
    it('should collect from multiple collectors', (done) => {
        const collector1 = new MockCollector();
        const collector2 = new MockCollector();
        agent.registerCollector('test1', collector1);
        agent.registerCollector('test2', collector2);
        agent.on('metrics', (metrics) => {
            expect(metrics).toHaveLength(2); // Should collect from both collectors
            //@ts-ignore ignore any for metric map
            expect(metrics.map(m => m.name)).toContain('test.metric');
            done();
        });
        agent.start();
    });
    /**
     * Test: Collector start failure
     * - Tests error handling during collector start
     * - Verifies agent state on failure
     */
    it('should handle collector start failure', async () => {
        const failingCollector = {
            start: async () => { throw new Error('Start failed'); },
            stop: async () => { },
            collect: async () => []
        };
        agent.registerCollector('failing', failingCollector);
        await expect(agent.start()).rejects.toThrow('Start failed');
        expect(agent['isRunning']).toBe(false);
    });
});
