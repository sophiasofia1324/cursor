type EventHandler = (data: any) => void;

export class ChartEventBus {
  private static instance: ChartEventBus;
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventCache: Map<string, any[]> = new Map();
  private maxCacheSize = 10;

  static getInstance() {
    if (!ChartEventBus.instance) {
      ChartEventBus.instance = new ChartEventBus();
    }
    return ChartEventBus.instance;
  }

  on(chartId: string, event: string, handler: EventHandler) {
    const key = `${chartId}:${event}`;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, new Set());
    }
    this.handlers.get(key)!.add(handler);

    // 发送缓存的事件
    const cachedEvents = this.eventCache.get(key) || [];
    cachedEvents.forEach(data => handler(data));

    return () => this.off(chartId, event, handler);
  }

  off(chartId: string, event: string, handler: EventHandler) {
    const key = `${chartId}:${event}`;
    const handlers = this.handlers.get(key);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(key);
      }
    }
  }

  emit(chartId: string, event: string, data: any) {
    const key = `${chartId}:${event}`;
    
    // 缓存事件
    if (!this.eventCache.has(key)) {
      this.eventCache.set(key, []);
    }
    const cache = this.eventCache.get(key)!;
    cache.push(data);
    if (cache.length > this.maxCacheSize) {
      cache.shift();
    }

    // 触发处理器
    const handlers = this.handlers.get(key);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  clear(chartId?: string) {
    if (chartId) {
      [...this.handlers.keys()]
        .filter(key => key.startsWith(`${chartId}:`))
        .forEach(key => {
          this.handlers.delete(key);
          this.eventCache.delete(key);
        });
    } else {
      this.handlers.clear();
      this.eventCache.clear();
    }
  }
}

export const chartEventBus = ChartEventBus.getInstance(); 