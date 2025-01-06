import { CpuCollector } from './CpuCollector';
import { Config } from './../core/Config';

describe('CpuCollector', () => {
  let collector: CpuCollector;
  let config: Config;

  beforeEach(() => {
    config = new Config({ cpuProfilingDuration: 100 });
    collector = new CpuCollector(config);
  });

  afterEach(async () => {
    await collector.stop();
  });

  /**
   * Test: Collector initialization
   * - Verifies CPU usage baseline
   * - Checks collector state
   * - Ensures proper startup
   */
  it('should initialize correctly', async () => {
    await collector.start();
    
    expect(collector['isRunning']).toBe(true); //Collector should be running after start
    expect(collector['lastUsage']).toBeDefined(); //Should establish CPU usage baseline
    
    await collector.stop();
    expect(collector['lastUsage']).toBeNull(); //Should clear usage data on stop
  });

  /**
   * Test: CPU metrics collection
   * - Verifies metric format
   * - Tests CPU time calculation
   * - Ensures proper units
   */
  it('should collect CPU metrics', async () => {
    await collector.start();
    
    // Generate some CPU load
    const startTime = Date.now();
    while (Date.now() - startTime < 50) {
      Math.random();
    }

    const metrics = await collector.collect();
    
    expect(metrics).toHaveLength(2); //Should return user and system CPU metrics
    
    const userMetric = metrics.find(m => m.name === 'cpu.user');
    const systemMetric = metrics.find(m => m.name === 'cpu.system');
    
    expect(userMetric).toBeDefined();
    expect(systemMetric).toBeDefined();
    expect(userMetric!.metadata?.unit).toBe('percent'); //Should report CPU usage as percentage
  });

  /**
   * Test: CPU utilization calculation
   * - Verifies percentage calculation
   * - Tests measurement duration
   * - Ensures accurate timing
   */
  it('should calculate CPU utilization correctly', async () => {
    await collector.start();
    
    // Simulate CPU-intensive task
    const startTime = Date.now();
    while (Date.now() - startTime < 50) {
      Math.random();
    }

    const metrics = await collector.collect();
    
    metrics.forEach(metric => {
      expect(metric.value).toBeGreaterThanOrEqual(0); //CPU usage should be non-negative
      expect(metric.value).toBeLessThanOrEqual(100); //CPU usage should not exceed 100%
      expect(metric.metadata?.duration).toBe(config.cpuProfilingDuration); //Should respect configured profiling duration
    });
  });

  /**
   * Test: Error handling
   * - Verifies collection state validation
   * - Tests error conditions
   * - Ensures proper cleanup
   */
  it('should handle errors appropriately', async () => {
    await expect(collector.collect()).rejects.toThrow(
      'Collector must be started before collecting metrics');

    await collector.start();
    await collector.stop();
    
    await expect(collector.collect()).rejects.toThrow(
      'Collector must be started before collecting metrics');
  });

  /**
   * Test: Multiple collections
   * - Verifies continuous monitoring
   * - Tests delta calculations
   * - Ensures consistent results
   */
  it('should handle multiple collections', async () => {
    await collector.start();
    
    const firstMetrics = await collector.collect();
    const secondMetrics = await collector.collect();
    
    expect(firstMetrics).toHaveLength(2);
    expect(secondMetrics).toHaveLength(2);
    
    firstMetrics.forEach((metric, index) => {
      expect(metric.name).toBe(secondMetrics[index].name); //Metric names should be consistent across collections
      expect(typeof metric.value).toBe('number'); //CPU metrics should always be numeric
    });
  });
});