interface PreprocessConfig {
  sampling?: {
    enabled: boolean;
    method: 'systematic' | 'random' | 'lttb';
    size: number;
  };
  aggregation?: {
    enabled: boolean;
    method: 'sum' | 'average' | 'max' | 'min';
    field: string;
    groupBy: string;
  };
  filter?: {
    enabled: boolean;
    conditions: Array<{
      field: string;
      operator: '>' | '<' | '=' | '!=' | 'contains';
      value: any;
    }>;
  };
  sort?: {
    enabled: boolean;
    field: string;
    order: 'asc' | 'desc';
  };
}

export class DataPreprocessor {
  private static instance: DataPreprocessor;

  static getInstance() {
    if (!DataPreprocessor.instance) {
      DataPreprocessor.instance = new DataPreprocessor();
    }
    return DataPreprocessor.instance;
  }

  process(data: any[], config: PreprocessConfig): any[] {
    let processed = [...data];

    if (config.filter?.enabled) {
      processed = this.applyFilter(processed, config.filter);
    }

    if (config.sort?.enabled) {
      processed = this.applySort(processed, config.sort);
    }

    if (config.aggregation?.enabled) {
      processed = this.applyAggregation(processed, config.aggregation);
    }

    if (config.sampling?.enabled) {
      processed = this.applySampling(processed, config.sampling);
    }

    return processed;
  }

  private applyFilter(data: any[], config: Required<PreprocessConfig>['filter']): any[] {
    return data.filter(item => {
      return config.conditions.every(condition => {
        const value = item[condition.field];
        switch (condition.operator) {
          case '>': return value > condition.value;
          case '<': return value < condition.value;
          case '=': return value === condition.value;
          case '!=': return value !== condition.value;
          case 'contains': return String(value).includes(condition.value);
          default: return true;
        }
      });
    });
  }

  private applySort(data: any[], config: Required<PreprocessConfig>['sort']): any[] {
    return data.sort((a, b) => {
      const aValue = a[config.field];
      const bValue = b[config.field];
      return config.order === 'asc' 
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });
  }

  private applyAggregation(data: any[], config: Required<PreprocessConfig>['aggregation']): any[] {
    const groups = new Map<string, any[]>();
    
    // 分组
    data.forEach(item => {
      const key = item[config.groupBy];
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    // 聚合
    return Array.from(groups.entries()).map(([key, group]) => {
      const result = { [config.groupBy]: key };
      switch (config.method) {
        case 'sum':
          result[config.field] = group.reduce((sum, item) => sum + item[config.field], 0);
          break;
        case 'average':
          result[config.field] = String(group.reduce((sum, item) => sum + item[config.field], 0) / group.length);
          break;
        case 'max':
          result[config.field] = String(Math.max(...group.map(item => item[config.field])));
          break;
        case 'min':
          result[config.field] = String(Math.min(...group.map(item => item[config.field])));
          break;
      }
      return result;
    });
  }

  private applySampling(data: any[], config: Required<PreprocessConfig>['sampling']): any[] {
    switch (config.method) {
      case 'systematic':
        return this.systematicSampling(data, config.size);
      case 'random':
        return this.randomSampling(data, config.size);
      case 'lttb':
        return this.largestTriangleThreeBuckets(data, config.size);
      default:
        return data;
    }
  }

  private systematicSampling(data: any[], size: number): any[] {
    const step = Math.max(1, Math.floor(data.length / size));
    return data.filter((_, index) => index % step === 0);
  }

  private randomSampling(data: any[], size: number): any[] {
    const sampled = new Set<number>();
    while (sampled.size < Math.min(size, data.length)) {
      sampled.add(Math.floor(Math.random() * data.length));
    }
    return Array.from(sampled).sort().map(index => data[index]);
  }

  private largestTriangleThreeBuckets(data: any[], size: number): any[] {
    // 实现LTTB算法
    return data;
  }
}

export const dataPreprocessor = DataPreprocessor.getInstance(); 