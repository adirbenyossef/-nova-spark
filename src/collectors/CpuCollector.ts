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
export class CpuCollector implements Collector {
  private readonly config: Config;
  private isRunning: boolean;
  private lastUsage: NodeJS.CpuUsage | null;
  private lastTimestamp: [number, number] | null;


  /**
   * Creates a new CpuCollector instance.
   * 
   * @param {Config} config - Configuration for the collector
   */
  constructor(config: Config) {
    this.config = config;
    this.isRunning = false;
    this.lastUsage = null;
    this.lastTimestamp = null;
  }

  /**
   * Initializes the CPU collector.
   * 
   * Sets up initial CPU usage baseline for delta calculations.
   * 
   * @returns {Promise<void>} Resolves when initialization is complete
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.lastUsage = process.cpuUsage();
    this.lastTimestamp = process.hrtime();
    this.isRunning = true;
  }

  /**
   * Stops the CPU collector.
   * 
   * Cleans up resources and resets the collector state.
   * 
   * @returns {Promise<void>} Resolves when cleanup is complete
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.lastUsage = null;
    this.lastTimestamp = null;
    this.isRunning = false;
  }

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
  async collect(): Promise<Metric[]> {
    if (!this.isRunning || !this.lastUsage || !this.lastTimestamp) {
      throw new Error('Collector must be started before collecting metrics');
    }

    const currentUsage = process.cpuUsage(this.lastUsage);
    const elapsedTime = process.hrtime(this.lastTimestamp);
    const elapsedMs = (elapsedTime[0] * 1e9 + elapsedTime[1]) / 1e6;

    const numCPUs = require('os').cpus().length;
    const userCpuPercent = (currentUsage.user / 1000 / elapsedMs) * 100 / numCPUs;
    const systemCpuPercent = (currentUsage.system / 1000 / elapsedMs) * 100 / numCPUs;

    this.lastUsage = process.cpuUsage();
    this.lastTimestamp = process.hrtime();

    return [
      {
        name: 'cpu.user',
        value: Math.min(100, Math.max(0, userCpuPercent)),
        timestamp: Date.now(),
        type: 'cpu',
        metadata: { unit: 'percent', duration: this.config.cpuProfilingDuration }
      },
      {
        name: 'cpu.system',
        value: Math.min(100, Math.max(0, systemCpuPercent)),
        timestamp: Date.now(),
        type: 'cpu',
        metadata: { unit: 'percent', duration: this.config.cpuProfilingDuration }
      }
    ];


    // const metrics: Metric[] = [];
    // const startUsage = process.cpuUsage(this.lastUsage || undefined);

    // // Wait for the configured duration
    // await new Promise(resolve => setTimeout(resolve, this.config.cpuProfilingDuration));

    // const endUsage = process.cpuUsage(startUsage);
    // const timestamp = Date.now();

    // // Store for next delta calculation
    // this.lastUsage = process.cpuUsage();

    // // Calculate CPU utilization percentage
    // const totalTime = this.config.cpuProfilingDuration * 1000; // Convert to microseconds
    // const userPercent = (endUsage.user / totalTime) * 100;
    // const systemPercent = (endUsage.system / totalTime) * 100;

    // metrics.push({
    //   name: 'cpu.user',
    //   value: userPercent,
    //   timestamp,
    //   type: 'cpu',
    //   metadata: { 
    //     unit: 'percent',
    //     raw: endUsage.user,
    //     duration: this.config.cpuProfilingDuration
    //   }
    // });

    // metrics.push({
    //   name: 'cpu.system',
    //   value: systemPercent,
    //   timestamp,
    //   type: 'cpu',
    //   metadata: { 
    //     unit: 'percent',
    //     raw: endUsage.system,
    //     duration: this.config.cpuProfilingDuration
    //   }
    // });

    // return metrics;
  }
} 