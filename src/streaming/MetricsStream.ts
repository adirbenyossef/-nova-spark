import { Metric } from '../core/Collector';
import { Config } from '../core/Config';
import { EventEmitter } from 'events';

/**
 * Streams and buffers metrics for efficient processing and transmission.
 * 
 * MetricsStream extends EventEmitter to provide a streaming interface for
 * metric data, with configurable buffering and automatic flushing.
 * 
 * @extends EventEmitter
 * 
 * @example
 * ```typescript
 * const config = new Config({ metricsBufferSize: 1000 });
 * const stream = new MetricsStream(config);
 * 
 * stream.on('data', (metrics) => {
 *   console.log('Processing metrics batch:', metrics);
 * });
 * 
 * stream.push(newMetrics);
 * ```
 * 
 * @fires MetricsStream#data
 */
export class MetricsStream extends EventEmitter {
  private readonly config: Config;
  private readonly buffer: Metric[];

  /**
   * Creates a new MetricsStream instance.
   * 
   * @param {Config} config - Configuration for the metrics stream
   */
  constructor(config: Config) {
    super();
    this.config = config;
    this.buffer = [];
  }

  /**
   * Adds metrics to the buffer.
   * 
   * Automatically flushes the buffer when it reaches the configured size.
   * 
   * @param {Metric[]} metrics - Array of metrics to add to the buffer
   * 
   * @example
   * ```typescript
   * stream.push([
   *   {
   *     name: 'memory.heapUsed',
   *     value: 1234567,
   *     timestamp: Date.now(),
   *     type: 'memory'
   *   }
   * ]);
   * ```
   */
  public push(metrics: Metric[]): void {
    // Create immutable copies of the metrics before adding to buffer
    const immutableMetrics = metrics.map(metric => Object.freeze({ ...metric }));
    this.buffer.push(...immutableMetrics);

    if (this.buffer.length >= this.config.metricsBufferSize) {
      this.flush();
    }
  }

  /**
   * Forces emission of currently buffered metrics.
   * 
   * Emits a 'data' event with the current buffer contents and clears the buffer.
   * 
   * @fires MetricsStream#data
   */
  public flush(): void {
    if (this.buffer.length > 0) {
      /**
       * Data event.
       * 
       * @event MetricsStream#data
       * @type {Metric[]}
       */
       // Create a frozen copy of the buffer before emitting
       const metricsToEmit = Object.freeze([...this.buffer]);
       this.emit('data', metricsToEmit);
       this.buffer.length = 0;
    }
  }

  /**
   * Clears the metrics buffer without emitting.
   * 
   * Useful for resetting the stream state without processing buffered metrics.
   */
  public clear(): void {
    this.buffer.length = 0;
  }
} 