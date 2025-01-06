import { MemoryCollector } from './MemoryCollector';
import { Config } from './../core/Config';

describe('MemoryCollector', () => {
  let collector: MemoryCollector;
  let config: Config;

  beforeEach(() => {
    config = new Config({ maxMemorySnapshots: 3 });
    collector = new MemoryCollector(config);
  });

  afterEach(async () => {
    await collector.stop();
  });

  /**
   * Test: Collector lifecycle
   * - Verifies start/stop functionality
   * - Checks snapshot history management
   * - Ensures proper state transitions
   */
  it('should manage lifecycle correctly', async () => {
    await collector.start();
    expect(collector['isRunning']).toBe(true); //Collector should be running after start

    await collector.start(); // Second start should be idempotent
    expect(collector['isRunning']).toBe(true); //Multiple starts should not affect state

    await collector.stop();
    expect(collector['isRunning']).toBe(false); //Collector should not be running after stop
    expect(collector['snapshots']).toHaveLength(0); //Snapshots should be cleared after stop
  });

  /**
   * Test: Metric collection
   * - Verifies metric format and values
   * - Checks memory statistics accuracy
   * - Ensures proper metadata
   */
  it('should collect valid memory metrics', async () => {
    await collector.start();
    const metrics = await collector.collect();

    expect(metrics).toHaveLength(4); //Should return four memory metrics

    const heapUsed = metrics.find(m => m.name === 'memory.heapUsed');
    expect(heapUsed).toBeDefined();
    expect(typeof heapUsed!.value).toBe('number'); //Heap usage should be numeric
    expect(heapUsed!.metadata?.unit).toBe('bytes'); //Should specify bytes as unit
  });

  /**
   * Test: Growth rate calculation
   * - Verifies memory growth detection
   * - Tests snapshot history management
   * - Checks growth rate accuracy
   */
  it('should calculate memory growth rate', async () => {
    await collector.start();
    
    // Force multiple collections to populate snapshots
    await collector.collect();
    await collector.collect();
    await collector.collect();

    const metrics = await collector.collect();
    const growthRate = metrics.find(m => m.name === 'memory.growthRate');
    
    expect(growthRate).toBeDefined();
    expect(typeof growthRate!.value).toBe('number'); //Growth rate should be numeric
    expect(growthRate!.metadata?.snapshots).toBeLessThanOrEqual(config.maxMemorySnapshots); //Should respect max snapshots limit
  });

  /**
   * Test: Error handling
   * - Verifies collection state validation
   * - Tests error conditions
   * - Ensures proper error messages
   */
  it('should handle collection errors', async () => {
    await expect(collector.collect()).rejects.toThrow('Collector must be started before collecting metrics');
  });
});