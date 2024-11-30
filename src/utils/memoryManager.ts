interface MemoryConfig {
  maxCacheSize?: number;  // MB
  cleanupInterval?: number;  // ms
  warningThreshold?: number;  // 0-1
  criticalThreshold?: number;  // 0-1
}

export class ChartMemoryManager {
  private static instance: ChartMemoryManager;
  private disposables: Set<() => void> = new Set();
  private config: Required<MemoryConfig>;
  private isMonitoring = false;

  private readonly DEFAULT_CONFIG: Required<MemoryConfig> = {
    maxCacheSize: 100,  // 100MB
    cleanupInterval: 30000,  // 30s
    warningThreshold: 0.8,  // 80%
    criticalThreshold: 0.9  // 90%
  };

  private constructor(config: MemoryConfig = {}) {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
    this.startMonitoring();
  }

  static getInstance(config?: MemoryConfig) {
    if (!ChartMemoryManager.instance) {
      ChartMemoryManager.instance = new ChartMemoryManager(config);
    }
    return ChartMemoryManager.instance;
  }

  register(disposable: () => void) {
    this.disposables.add(disposable);
  }

  unregister(disposable: () => void) {
    this.disposables.delete(disposable);
  }

  private startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    const checkMemory = () => {
      if (!this.isMonitoring) return;

      const memory = (performance as any).memory;
      if (!memory) return;

      const usedRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

      if (usedRatio > this.config.criticalThreshold) {
        this.forceClearMemory();
        console.warn('Critical memory usage detected, forcing cleanup');
      } else if (usedRatio > this.config.warningThreshold) {
        this.cleanup();
        console.warn('High memory usage detected, cleaning up');
      }

      setTimeout(checkMemory, this.config.cleanupInterval);
    };

    checkMemory();
  }

  cleanup() {
    // 执行注册的清理函数
    this.disposables.forEach(dispose => {
      try {
        dispose();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });

    // 清理缓存
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.startsWith('chart-cache-')) {
            caches.delete(name);
          }
        });
      });
    }

    // 建议垃圾回收
    if (window.gc) {
      window.gc();
    }
  }

  forceClearMemory() {
    this.cleanup();
    this.disposables.clear();
    
    // 清除所有图表实例
    const charts = document.querySelectorAll('[data-chart-instance]');
    charts.forEach(chart => {
      const instance = (chart as any).__echarts_instance__;
      if (instance) {
        instance.dispose();
      }
    });
  }

  stopMonitoring() {
    this.isMonitoring = false;
  }
}

export const memoryManager = ChartMemoryManager.getInstance(); 