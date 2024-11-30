interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class ChartDataCache {
  private static instance: ChartDataCache;
  private cache: Map<string, CacheItem<any>> = new Map();
  private maxSize: number = 50;  // 最大缓存条目数
  private defaultExpiry: number = 5 * 60 * 1000;  // 默认5分钟过期

  private constructor() {
    // 定期清理过期数据
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  static getInstance() {
    if (!ChartDataCache.instance) {
      ChartDataCache.instance = new ChartDataCache();
    }
    return ChartDataCache.instance;
  }

  set<T>(key: string, data: T, expiry: number = this.defaultExpiry) {
    // 如果缓存已满，删除最旧的数据
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const chartDataCache = ChartDataCache.getInstance(); 