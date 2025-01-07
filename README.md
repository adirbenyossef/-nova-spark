# Nova Spark


**Author:**  💫 Adir Ben Yosef  
**GitHub:** [https://github.com/adirbenyossef](https://github.com/adirbenyossef)

Nova Spark is a performance monitoring and diagnostics tool for Node.js applications. It provides a centralized metrics collection system, allowing developers to monitor various aspects of their applications, including CPU usage, memory consumption, and more.

##  ⛓️ Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Configuration](#configuration)
  - [Registering Collectors](#registering-collectors)
  - [Starting the Agent](#starting-the-agent)
  - [Handling Metrics](#handling-metrics)
- [Examples](#examples)
  - [TypeScript Example](#typescript-example)
  - [JavaScript Example](#javascript-example)

<a name="installation"/>

## Installation

To install Nova Spark:

```bash
    npm install @nova/spark
```

<a name="usage"/>

## Usage

<a name="configuration"/>

### Configuration

You can configure the agent with various options such as sample interval, enabled status, and more.

```typescript
    import { Config } from '@nova/spark';

    const config = new Config({
        sampleInterval: 5000, // Collect metrics every 5 seconds
        enabled: true,
        maxMemorySnapshots: 10,
    });
```
<a name="registering-collectors"/>

### Registering Collectors

You can register different collectors to gather specific metrics. For example, you can register a CPU collector and a memory collector.

```typescript
import { Agent } from '@nova/spark';
import { CpuCollector } from '@nova/spark/collectors/CpuCollector';
import { MemoryCollector } from '@nova/spark/collectors/MemoryCollector';

const agent = new Agent(config);
agent.registerCollector('cpu', new CpuCollector(agent.getConfig()));
agent.registerCollector('memory', new MemoryCollector(agent.getConfig()));
```


<a name="starting-the-agent"/>

### Starting the Agent

Once you have registered your collectors, you can start the agent to begin collecting metrics.

```typescript
    await agent.start();
    console.log('Agent started successfully');
```
<a name="handling-metrics"/>

### Handling Metrics

You can listen for metrics events emitted by the agent to handle the collected data.

```typescript
agent.on('metrics', (metrics) => {
    metrics.forEach(metric => {
        console.log(${metric.name}: ${metric.value});
    });
});
```

- [Examples](#)
  - [TypeScript Example](#)
  - [](#-example)
- [](#)
- [Contributing](#)
- [License](#license)


<a name="examples"/>

## Examples

<a name="typescript-example"/>

### TypeScript Example

Here’s a complete example of using Nova Spark in a TypeScript application:

```typescript
import { Agent } from '@nova/spark';
import { Config } from '@nova/spark';
import { CpuCollector } from '@nova/spark/collectors/CpuCollector';
import { MemoryCollector } from '@nova/spark/collectors/MemoryCollector';
import { Metric } from '@nova/spark/core/Collector'; // Import the Metric type

const config = new Config({
  sampleInterval: 5000, // Collect metrics every 5 seconds
  enabled: true,
  maxMemorySnapshots: 10,
});

// Create an instance of the Agent
const agent = new Agent(config);

// Register collectors for CPU and memory metrics
agent.registerCollector('cpu', new CpuCollector(agent.getConfig()));
agent.registerCollector('memory', new MemoryCollector(agent.getConfig()));

// Listen for metrics events
agent.on('metrics', (metrics: Metric[]) => { // Specify the type of metrics
  metrics.forEach((metric: Metric) => { // Specify the type for each metric
    console.log(`${metric.name}: ${metric.value}`);
  });
});

// Start the agent and begin collecting metrics
(async () => {
  await agent.start();
  console.log('Agent started successfully');
})();
```

<a name="javascript-example"/>

### JavaScript Example

Here’s a complete example of using Nova Spark in a TypeScript application:

```javascript
const { Agent } = require('@nova/spark');
const { Config } = require('@nova/spark');
const { CpuCollector } = require('@nova/spark/collectors/CpuCollector');
const { MemoryCollector } = require('@nova/spark/collectors/MemoryCollector');

const config = new Config({
    sampleInterval: 5000,
    enabled: true,
    maxMemorySnapshots: 10,
});
const agent = new Agent(config);
agent.registerCollector('cpu', new CpuCollector(agent.getConfig()));
agent.registerCollector('memory', new MemoryCollector(agent.getConfig()));
agent.on('metrics', (metrics) => {
    metrics.forEach(metric => {
        console.log(${metric.name}: ${metric.value});
    });
});
(async () => {
    await agent.start();
    console.log('Agent started successfully');
})();
```


