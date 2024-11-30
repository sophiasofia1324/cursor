type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export class ChartConfigManager {
  private static instance: ChartConfigManager;
  private configs: Map<string, any> = new Map();
  private defaults: Map<string, any> = new Map();

  static getInstance() {
    if (!ChartConfigManager.instance) {
      ChartConfigManager.instance = new ChartConfigManager();
    }
    return ChartConfigManager.instance;
  }

  setConfig<T extends object>(chartId: string, config: DeepPartial<T>) {
    const currentConfig = this.configs.get(chartId) || {};
    this.configs.set(chartId, this.deepMerge(currentConfig, config));
  }

  getConfig<T>(chartId: string): T {
    return this.configs.get(chartId) || this.defaults.get(chartId) || {};
  }

  setDefault<T extends object>(chartType: string, config: T) {
    this.defaults.set(chartType, config);
  }

  resetConfig(chartId: string) {
    const chartType = chartId.split('-')[0];
    this.configs.set(chartId, { ...this.defaults.get(chartType) });
  }

  private deepMerge<T>(target: T, source: DeepPartial<T>): T {
    const result = { ...target };
    for (const key in source) {
      const value = source[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.deepMerge(result[key], value);
      } else {
        result[key] = value as any;
      }
    }
    return result;
  }

  clearConfig(chartId?: string) {
    if (chartId) {
      this.configs.delete(chartId);
    } else {
      this.configs.clear();
    }
  }
}

export const configManager = ChartConfigManager.getInstance(); 