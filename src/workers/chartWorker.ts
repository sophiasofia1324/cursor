import { ChartDataProcessor } from '../utils/dataProcessor';
import { ChartMetricsCalculator } from '../utils/metricsCalculator';
import { ChartOptimizer } from '../utils/chartOptimizer';

const ctx: Worker = self as any;

ctx.onmessage = async (event: MessageEvent) => {
  const { type, data, id } = event.data;

  try {
    let result;
    switch (type) {
      case 'processData':
        result = await ChartDataProcessor.process(data.data, data.options);
        break;
      case 'calculateMetrics':
        result = await ChartMetricsCalculator.calculate(data.data, data.metrics);
        break;
      case 'optimize':
        result = await ChartOptimizer.optimize(data.data, data.optimizationConfig);
        break;
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    ctx.postMessage({ id, result });
  } catch (error) {
    ctx.postMessage({ id, error: error.message });
  }
}; 