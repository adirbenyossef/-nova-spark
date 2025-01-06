"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
describe('Metric Interface', () => {
    /**
     * Test: Metric structure validation
     * - Creates metrics with different value types
     * - Verifies type compatibility
     * - Ensures required fields are present
     */
    it('should support different value types', () => {
        const numericMetric = {
            name: 'test.numeric',
            value: 100,
            timestamp: Date.now(),
            type: 'memory'
        };
        const stringMetric = {
            name: 'test.string',
            value: 'active',
            timestamp: Date.now(),
            type: 'cpu'
        };
        const objectMetric = {
            name: 'test.object',
            value: { used: 100, total: 1000 },
            timestamp: Date.now(),
            type: 'eventloop'
        };
        expect(numericMetric.value).toBeDefined();
        expect(stringMetric.value).toBeDefined();
        expect(objectMetric.value).toBeDefined();
    });
    /**
     * Test: Metric metadata handling
     * - Creates metric with various metadata
     * - Verifies metadata structure
     * - Confirms optional nature of metadata
     */
    it('should handle optional metadata correctly', () => {
        const metricWithMetadata = {
            name: 'test.metadata',
            value: 100,
            timestamp: Date.now(),
            type: 'memory',
            metadata: {
                unit: 'bytes',
                threshold: 1000,
                tags: ['production']
            }
        };
        const metricWithoutMetadata = {
            name: 'test.no.metadata',
            value: 200,
            timestamp: Date.now(),
            type: 'memory'
        };
        expect(metricWithMetadata.metadata).toBeDefined();
        expect(metricWithoutMetadata.metadata).toBeUndefined();
    });
    /**
     * Test: Metric naming convention
     * - Verifies metric name format
     * - Tests category.measurement pattern
     * - Ensures consistency
     */
    it('should follow naming convention', () => {
        const metric = {
            name: 'memory.heapUsed',
            value: 1000,
            timestamp: Date.now(),
            type: 'memory'
        };
        expect(metric.name).toMatch(/^[a-z]+\.[a-zA-Z]+$/); //Metric name should follow category.measurement pattern
    });
});
