interface RenderConfig {
  minRenderInterval?: number;
  batchSize?: number;
  useRequestIdleCallback?: boolean;
}

export class ChartRenderOptimizer {
  private static instance: ChartRenderOptimizer;
  private renderQueue: Array<() => void> = [];
  private isProcessing = false;
  private lastRenderTime = 0;
  private config: RenderConfig;

  private constructor(config: RenderConfig = {}) {
    this.config = {
      minRenderInterval: 16, // ~60fps
      batchSize: 5,
      useRequestIdleCallback: true,
      ...config
    };
  }

  static getInstance(config?: RenderConfig) {
    if (!ChartRenderOptimizer.instance) {
      ChartRenderOptimizer.instance = new ChartRenderOptimizer(config);
    }
    return ChartRenderOptimizer.instance;
  }

  scheduleRender(renderFn: () => void, priority: 'high' | 'normal' | 'low' = 'normal') {
    if (priority === 'high') {
      this.renderQueue.unshift(renderFn);
    } else if (priority === 'low') {
      this.renderQueue.push(renderFn);
    } else {
      const insertIndex = Math.floor(this.renderQueue.length / 2);
      this.renderQueue.splice(insertIndex, 0, renderFn);
    }

    if (!this.isProcessing) {
      this.processRenderQueue();
    }
  }

  private async processRenderQueue() {
    if (this.isProcessing || this.renderQueue.length === 0) return;

    this.isProcessing = true;
    const now = performance.now();
    const timeSinceLastRender = now - this.lastRenderTime;

    if (timeSinceLastRender < this.config.minRenderInterval!) {
      await new Promise(resolve => 
        setTimeout(resolve, this.config.minRenderInterval! - timeSinceLastRender)
      );
    }

    const processBatch = () => {
      const batch = this.renderQueue.splice(0, this.config.batchSize!);
      batch.forEach(renderFn => {
        try {
          renderFn();
        } catch (error) {
          console.error('Error during render:', error);
        }
      });

      if (this.renderQueue.length > 0) {
        if (this.config.useRequestIdleCallback && 'requestIdleCallback' in window) {
          (window as any).requestIdleCallback(() => processBatch());
        } else {
          requestAnimationFrame(() => processBatch());
        }
      } else {
        this.isProcessing = false;
      }
    };

    processBatch();
    this.lastRenderTime = performance.now();
  }

  clearRenderQueue() {
    this.renderQueue = [];
    this.isProcessing = false;
  }
}

export const renderOptimizer = ChartRenderOptimizer.getInstance(); 