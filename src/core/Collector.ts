/**
 * Represents a metric data point collected by a collector.
 * 
 * A metric contains information about a specific measurement, including its
 * name, value, timestamp, type, and optional metadata.
 * 
 * @interface Metric
 * 
 * @example
 * ```typescript
 * const metric: Metric = {
 *   name: 'memory.heapUsed',
 *   value: 1234567,
 *   timestamp: Date.now(),
 *   type: 'memory',
 *   metadata: { unit: 'bytes' }
 * };
 * ```
 */
export interface Metric {
  /**
   * The unique identifier for the metric.
   * Should follow the format: 'category.measurement'
   * @example 'memory.heapUsed', 'cpu.user', 'eventloop.lag'
   */
  name: string;

  /**
   * The measured value. Can be:
   * - number: For numerical measurements
   * - string: For status or descriptive metrics
   * - object: For complex measurements
   */
  value: number | string | object;

  /**
   * Unix timestamp (in milliseconds) when the metric was collected
   */
  timestamp: number;

  /**
   * The category of the metric.
   * Used for grouping and filtering metrics.
   */
  type: 'memory' | 'cpu' | 'eventloop';

  /**
   * Additional contextual information about the metric.
   * Common metadata includes:
   * - unit: The unit of measurement
   * - threshold: Warning/critical thresholds
   * - tags: Additional categorization
   */
  metadata?: Record<string, any>;
}

/**
 * Defines the interface for metric collectors.
 * 
 * A collector is responsible for gathering specific types of metrics
 * from the Node.js runtime or application. Each collector focuses on
 * a specific aspect (e.g., memory, CPU, event loop).
 * 
 * @interface Collector
 * 
 * @example
 * ```typescript
 * class CustomCollector implements Collector {
 *   async start(): Promise<void> {
 *     // Initialize collection resources
 *   }
 * 
 *   async stop(): Promise<void> {
 *     // Clean up resources
 *   }
 * 
 *   async collect(): Promise<Metric[]> {
 *     // Gather and return metrics
 *     return [{
 *       name: 'custom.metric',
 *       value: 123,
 *       timestamp: Date.now(),
 *       type: 'memory'
 *     }];
 *   }
 * }
 * ```
 */
export interface Collector {
  /**
   * Initializes the collector and its resources.
   * 
   * This method is called when the agent starts and should:
   * 1. Initialize any required resources
   * 2. Set up monitoring state
   * 3. Prepare for metric collection
   * 
   * @returns {Promise<void>} Resolves when initialization is complete
   * @throws {Error} If initialization fails
   */
  start(): Promise<void>;

  /**
   * Stops the collector and cleans up resources.
   * 
   * This method is called when the agent stops and should:
   * 1. Clean up any resources
   * 2. Stop any ongoing monitoring
   * 3. Reset collector state
   * 
   * @returns {Promise<void>} Resolves when cleanup is complete
   * @throws {Error} If cleanup fails
   */
  stop(): Promise<void>;

  /**
   * Collects and returns current metrics.
   * 
   * This method is called periodically by the agent and should:
   * 1. Gather relevant metrics
   * 2. Format them according to the Metric interface
   * 3. Return them in an array
   * 
   * @returns {Promise<Metric[]>} Resolves with an array of collected metrics
   * @throws {Error} If metric collection fails
   */
  collect(): Promise<Metric[]>;
} 