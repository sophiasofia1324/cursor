import { debounce, throttle } from 'lodash';

interface EventConfig {
  debounceWait?: number;
  throttleWait?: number;
  maxListeners?: number;
}

export class ChartEventOptimizer {
  private static readonly DEFAULT_CONFIG: EventConfig = {
    debounceWait: 100,
    throttleWait: 100,
    maxListeners: 10
  };

  private eventCount: Map<string, number> = new Map();
  private readonly config: EventConfig;

  constructor(config: Partial<EventConfig> = {}) {
    this.config = { ...ChartEventOptimizer.DEFAULT_CONFIG, ...config };
  }

  optimizeHandler<T extends (...args: any[]) => any>(
    eventType: string,
    handler: T,
    options: {
      useDebounce?: boolean;
      useThrottle?: boolean;
      priority?: 'high' | 'medium' | 'low';
    } = {}
  ): T {
    // 检查事件监听器数量
    const count = this.eventCount.get(eventType) || 0;
    if (count >= (this.config.maxListeners || 10)) {
      console.warn(`Warning: Event '${eventType}' has too many listeners (${count})`);
    }
    this.eventCount.set(eventType, count + 1);

    // 根据优先级调整等待时间
    const wait = options.priority === 'high' ? 50 :
                 options.priority === 'medium' ? 100 : 150;

    // 应用防抖或节流
    if (options.useDebounce) {
      return debounce(handler, wait) as T;
    }
    if (options.useThrottle) {
      return throttle(handler, wait) as T;
    }

    return handler;
  }

  createBatchHandler<T>(
    handlers: Array<(event: T) => void>,
    options: {
      parallel?: boolean;
      breakOnError?: boolean;
    } = {}
  ) {
    return async (event: T) => {
      if (options.parallel) {
        // 并行执行
        const promises = handlers.map(handler => 
          Promise.resolve().then(() => handler(event))
        );
        
        if (options.breakOnError) {
          await Promise.all(promises);
        } else {
          await Promise.allSettled(promises);
        }
      } else {
        // 串行执行
        for (const handler of handlers) {
          try {
            await Promise.resolve().then(() => handler(event));
          } catch (error) {
            if (options.breakOnError) throw error;
            console.error('Error in event handler:', error);
          }
        }
      }
    };
  }
} 