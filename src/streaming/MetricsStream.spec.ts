import { Config } from '../core/Config';
import { MetricsStream } from './MetricsStream';
import { Metric } from '../core/Collector';

describe('MetricsStream', () => {
    let stream: MetricsStream;
    let config: Config;
    
    const createMetric = (name: string, value: number): Metric => ({
      name,
      value,
      timestamp: Date.now(),
      type: 'memory',
      metadata: { unit: 'bytes' }
    });
  
    beforeEach(() => {
      config = new Config({ metricsBufferSize: 3 });
      stream = new MetricsStream(config);
    });
  
    /**
     * Test: Buffer accumulation and automatic emission
     * - Adds metrics one by one until buffer size is reached
     * - Verifies that metrics are held until buffer is full
     * - Confirms automatic emission occurs at exactly buffer size
     */
    it('should buffer metrics until reaching buffer size', (done) => {
      const metrics = [
        createMetric('test.metric1', 100),
        createMetric('test.metric2', 200)
      ];
  
      let emitCount = 0;
      stream.on('data', (emittedMetrics) => {
        emitCount++;
        expect(emittedMetrics).toHaveLength(3); //Buffer should emit exactly 3 metrics when full
        done();
      });
  
      stream.push([metrics[0]]);
      stream.push([metrics[1]]);
      expect(emitCount).toBe(0); //Buffer should not emit before reaching configured size
      stream.push([createMetric('test.metric3', 300)]);
    });
  
    /**
     * Test: Manual flush operation
     * - Adds single metric to non-full buffer
     * - Verifies manual flush emits regardless of buffer size
     * - Confirms emitted data matches input
     */
    it('should emit metrics when manually flushed', (done) => {
      const metrics = [createMetric('test.metric', 100)];
  
      stream.on('data', (emittedMetrics) => {
        expect(emittedMetrics).toHaveLength(1); //Manual flush should emit exact number of buffered metrics
        expect(emittedMetrics[0]).toEqual(metrics[0]); //Emitted metric should match original input
        done();
      });
  
      stream.push(metrics);
      stream.flush();
    });
  
    /**
     * Test: Buffer clearing operation
     * - Adds metric to buffer
     * - Clears buffer
     * - Verifies no emission occurs on subsequent flush
     */
    it('should clear buffer without emitting', () => {
      const metrics = [createMetric('test.metric', 100)];
      
      stream.on('data', () => {
        throw new Error('Buffer clear should not trigger data emission');
      });
  
      stream.push(metrics);
      stream.clear();
      stream.flush();
    });
  
    /**
     * Test: Multiple flush behavior
     * - Attempts empty flushes
     * - Verifies no emissions for empty buffer
     * - Confirms single emission for populated buffer
     */
    it('should handle multiple flush operations correctly', () => {
      const emitSpy = jest.spyOn(stream, 'emit');
      
      stream.flush();
      stream.flush();
      
      expect(emitSpy).not.toHaveBeenCalled(); //Empty buffer flushes should not trigger emissions
      
      stream.push([createMetric('test.metric', 100)]);
      stream.flush();
      
      expect(emitSpy).toHaveBeenCalledTimes(1); //Should emit exactly once when flushing non-empty buffer
    });
  
    /**
     * Test: Buffer size compliance
     * - Pushes more metrics than buffer size
     * - Verifies correct batch sizes in emissions
     * - Confirms all metrics are eventually emitted
     */
    it('should respect buffer size configuration', (done) => {
      const stream = new MetricsStream(new Config({ metricsBufferSize: 3 }));
      const metrics = Array.from({ length: 5 }, (_, i) => 
        createMetric(`test.metric${i}`, i * 100)
      );
      
      let emitCount = 0;
      stream.on('data', (emittedMetrics) => {
        emitCount++;
        if (emitCount === 1) {
          expect(emittedMetrics).toHaveLength(3); // First batch
        } else if (emitCount === 2) {
          expect(emittedMetrics).toHaveLength(2); // Second batch
          done();
        }
      });

      metrics.forEach(metric => stream.push([metric]));
      stream.flush(); // Force flush any remaining metrics
    }, 10000);
  
   /**
   * Test: Metric data immutability
   * - Emits metric and modifies original
   * - Verifies emitted data remains unchanged
   * - Confirms proper data isolation
   */
  it('should emit immutable metric copies', (done) => {
    const stream = new MetricsStream(new Config());
    const metric = createMetric('test.metric', 100);
    
    stream.on('data', (emittedMetrics) => {
      const emittedMetric = emittedMetrics[0];
      expect(emittedMetric).toEqual(metric); // Initial emitted metric should match original
      metric.value = 200;
      expect(emittedMetric.value).toBe(100); // Emitted metric should not be affected by modifications to original
      done();
    });

    stream.push([metric]);
    stream.flush(); // Add explicit flush call
    }, 10000); // Add timeout value
});