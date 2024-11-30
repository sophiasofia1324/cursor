interface PreloadConfig {
  maxConcurrent?: number;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export class ChartPreloader {
  private static instance: ChartPreloader;
  private loadQueue: Map<string, Promise<any>> = new Map();
  private config: Required<PreloadConfig>;
  private activeLoads = 0;

  private constructor(config: PreloadConfig = {}) {
    this.config = {
      maxConcurrent: 3,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  static getInstance(config?: PreloadConfig) {
    if (!ChartPreloader.instance) {
      ChartPreloader.instance = new ChartPreloader(config);
    }
    return ChartPreloader.instance;
  }

  async preloadChartData(
    key: string,
    dataLoader: () => Promise<any>,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ) {
    if (this.loadQueue.has(key)) {
      return this.loadQueue.get(key);
    }

    const loadPromise = this.queueLoad(key, dataLoader, priority);
    this.loadQueue.set(key, loadPromise);

    try {
      const data = await loadPromise;
      return data;
    } finally {
      this.loadQueue.delete(key);
    }
  }

  private async queueLoad(
    key: string,
    dataLoader: () => Promise<any>,
    priority: 'high' | 'normal' | 'low'
  ) {
    while (this.activeLoads >= this.config.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activeLoads++;

    try {
      return await this.loadWithRetry(dataLoader);
    } finally {
      this.activeLoads--;
    }
  }

  private async loadWithRetry(dataLoader: () => Promise<any>, attempt = 1): Promise<any> {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Load timeout')), this.config.timeout);
      });

      return await Promise.race([dataLoader(), timeoutPromise]);
    } catch (error) {
      if (attempt >= this.config.retryAttempts) {
        throw error;
      }

      await new Promise(resolve => 
        setTimeout(resolve, this.config.retryDelay * attempt)
      );

      return this.loadWithRetry(dataLoader, attempt + 1);
    }
  }

  clearQueue() {
    this.loadQueue.clear();
    this.activeLoads = 0;
  }
} 