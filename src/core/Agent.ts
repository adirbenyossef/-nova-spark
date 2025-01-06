import { EventEmitter } from 'events';
import { Config, SparkConfig } from './Config';
import { Collector, Metric } from './Collector';

/**
 * The Agent class extends EventEmitter to provide a centralized metrics collection
 * and monitoring system for Node.js applications.
 * 
 * The Agent manages multiple collectors and coordinates metric gathering based on
 * a configurable interval. It emits events when metrics are collected or when
 * errors occur.
 * 
 * @extends EventEmitter
 * 
 * @example
 * ```typescript
 * const agent = new Agent({ sampleInterval: 1000 });
 * 
 * agent.registerCollector('memory', new MemoryCollector(agent.getConfig()));
 * agent.registerCollector('cpu', new CpuCollector(agent.getConfig()));
 * 
 * agent.on('metrics', (metrics) => {
 *   console.log('Collected metrics:', metrics);
 * });
 * 
 * await agent.start();
 * ```
 * 
 * @fires Agent#metrics
 * @fires Agent#error
 */
export class Agent extends EventEmitter {
  private readonly config: Config;
  private readonly collectors: Map<string, Collector>;
  private isRunning: boolean;
  private collectionInterval?: NodeJS.Timeout;

  /**
   * Creates a new Agent instance.
   * 
   * @param {SparkConfig} [config] - Optional configuration options for the agent
   * @throws {Error} Will throw an error if the configuration is invalid
   * 
   * @example
   * ```typescript
   * const agent = new Agent({
   *   sampleInterval: 5000,
   *   enabled: true,
   *   maxMemorySnapshots: 10
   * });
   * ```
   */
  constructor(config?: SparkConfig) {
    super();
    this.config = new Config(config);
    this.collectors = new Map();
    this.isRunning = false;
  }

  /**
   * Registers a new collector with the agent.
   * 
   * @param {string} name - Unique identifier for the collector
   * @param {Collector} collector - The collector instance to register
   * @throws {Error} Will throw if a collector with the same name already exists
   * 
   * @example
   * ```typescript
   * const memoryCollector = new MemoryCollector(agent.getConfig());
   * agent.registerCollector('memory', memoryCollector);
   * ```
   */
  public registerCollector(name: string, collector: Collector): void {
    if (this.collectors.has(name)) {
      throw new Error('Collector already exists');
    }
    this.collectors.set(name, collector);
  }

  /**
   * Starts the agent and begins collecting metrics.
   * 
   * This method:
   * 1. Initializes all registered collectors
   * 2. Starts the collection interval
   * 3. Begins emitting metrics events
   * 
   * @returns {Promise<void>} Resolves when the agent has started
   * @throws {Error} Will throw if the agent fails to start or is already running
   * 
   * @example
   * ```typescript
   * try {
   *   await agent.start();
   *   console.log('Agent started successfully');
   * } catch (error) {
   *   console.error('Failed to start agent:', error);
   * }
   * ```
   */
  public async start(): Promise<void> {
    if (this.isRunning) return;
    
    try {
      // Start all collectors
      for (const collector of this.collectors.values()) {
        await collector.start();
      }
  
      this.isRunning = true; // Set to true only after all collectors have started
  
      // Begin collection cycle
      this.collectionInterval = setInterval(
        () => this.collect(),
        this.config.sampleInterval
      );
    } catch (error) {
      this.isRunning = false; // Ensure isRunning is false if starting fails
      throw new Error('Start failed');
    }
  }

  /**
   * Stops the agent and all collectors.
   * 
   * This method:
   * 1. Stops the collection interval
   * 2. Stops all registered collectors
   * 3. Cleans up resources
   * 
   * @returns {Promise<void>} Resolves when the agent has stopped
   * @throws {Error} Will throw if the agent fails to stop
   * 
   * @example
   * ```typescript
   * try {
   *   await agent.stop();
   *   console.log('Agent stopped successfully');
   * } catch (error) {
   *   console.error('Failed to stop agent:', error);
   * }
   * ```
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) return;

    try {

      if (this.collectionInterval) {
        clearInterval(this.collectionInterval);
      }
      
      // Stop all collectors
      for (const collector of this.collectors.values()) {
        await collector.stop();
      }
      
      this.isRunning = false;

    } catch(error) {
      throw new Error('Stop failed');
    }
  }

  /**
   * Collects metrics from all registered collectors.
   * 
   * This private method is called on each collection interval and:
   * 1. Gathers metrics from all collectors
   * 2. Emits a 'metrics' event with the collected data
   * 3. Emits an 'error' event if collection fails
   * 
   * @fires Agent#metrics
   * @fires Agent#error
   * @private
   */
  private async collect(): Promise<void> {
    try {
      const metrics: Metric[] = [];
      
      for (const collector of this.collectors.values()) {
        const collectorMetrics = await collector.collect();
        metrics.push(...collectorMetrics);
      }

      /**
       * Metrics event.
       * 
       * @event Agent#metrics
       * @type {Metric[]}
       * @example
       * ```typescript
       * agent.on('metrics', (metrics) => {
       *   metrics.forEach(metric => {
       *     console.log(`${metric.name}: ${metric.value}`);
       *   });
       * });
       * ```
       */
      this.emit('metrics', metrics);
    } catch (error) {
      /**
       * Error event.
       * 
       * @event Agent#error
       * @type {Error}
       * @example
       * ```typescript
       * agent.on('error', (error) => {
       *   console.error('Metrics collection failed:', error);
       * });
       * ```
       */
      this.emit('error', error);
    }
  }

  /**
   * Returns the current configuration of the agent.
   * 
   * @returns {Config} The current configuration object
   * 
   * @example
   * ```typescript
   * const config = agent.getConfig();
   * console.log('Sample interval:', config.sampleInterval);
   * ```
   */
  public getConfig(): Config {
    // Return a new Config instance with the same values to ensure immutability
    return new Config({
      sampleInterval: this.config.sampleInterval,
      enabled: this.config.enabled,
      maxMemorySnapshots: this.config.maxMemorySnapshots,
      cpuProfilingDuration: this.config.cpuProfilingDuration,
      eventLoopThreshold: this.config.eventLoopThreshold,
      metricsBufferSize: this.config.metricsBufferSize,
      debugMode: this.config.debugMode
    });
  }
} 