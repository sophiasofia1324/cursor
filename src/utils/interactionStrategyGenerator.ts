type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'heatmap';

interface InteractionStrategy {
  zoom?: {
    enabled: boolean;
    type: 'inside' | 'slider' | 'both';
    sensitivity?: number;
  };
  drag?: {
    enabled: boolean;
    mode: 'pan' | 'select';
  };
  tooltip?: {
    trigger: 'item' | 'axis' | 'none';
    showDelay?: number;
    formatter?: string | Function;
  };
  brush?: {
    enabled: boolean;
    type: string[];
  };
  highlight?: {
    enabled: boolean;
    series?: boolean;
    dataItem?: boolean;
  };
}

export class InteractionStrategyGenerator {
  private static instance: InteractionStrategyGenerator;
  private strategies: Map<string, InteractionStrategy> = new Map();

  static getInstance() {
    if (!InteractionStrategyGenerator.instance) {
      InteractionStrategyGenerator.instance = new InteractionStrategyGenerator();
      InteractionStrategyGenerator.instance.initDefaultStrategies();
    }
    return InteractionStrategyGenerator.instance;
  }

  private initDefaultStrategies() {
    // 折线图策略
    this.strategies.set('line', {
      zoom: {
        enabled: true,
        type: 'inside',
        sensitivity: 1.5
      },
      drag: {
        enabled: true,
        mode: 'pan'
      },
      tooltip: {
        trigger: 'axis',
        showDelay: 100
      },
      highlight: {
        enabled: true,
        series: true
      }
    });

    // 柱状图策略
    this.strategies.set('bar', {
      zoom: {
        enabled: true,
        type: 'slider'
      },
      tooltip: {
        trigger: 'item'
      },
      highlight: {
        enabled: true,
        dataItem: true
      }
    });

    // 饼图策略
    this.strategies.set('pie', {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      highlight: {
        enabled: true,
        dataItem: true
      }
    });
  }

  generateStrategy(chartType: ChartType, customConfig?: Partial<InteractionStrategy>): InteractionStrategy {
    const baseStrategy = this.strategies.get(chartType) || {};
    return {
      ...baseStrategy,
      ...customConfig
    };
  }

  registerStrategy(chartType: string, strategy: InteractionStrategy) {
    this.strategies.set(chartType, strategy);
  }

  getStrategy(chartType: string): InteractionStrategy | undefined {
    return this.strategies.get(chartType);
  }
}

export const interactionStrategyGenerator = InteractionStrategyGenerator.getInstance(); 