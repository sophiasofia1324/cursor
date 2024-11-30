interface WorkerMessage {
  type: 'processData' | 'calculateMetrics' | 'optimize';
  data: any;
  id: string;
}

export class ChartWorkerManager {
  private static instance: ChartWorkerManager;
  private worker: Worker;
  private callbacks: Map<string, (data: any) => void> = new Map();

  private constructor() {
    this.worker = new Worker(new URL('./workers/chartWorker.ts', import.meta.url));
    this.setupWorker();
  }

  static getInstance() {
    if (!ChartWorkerManager.instance) {
      ChartWorkerManager.instance = new ChartWorkerManager();
    }
    return ChartWorkerManager.instance;
  }

  private setupWorker() {
    this.worker.onmessage = (event: MessageEvent) => {
      const { id, result } = event.data;
      const callback = this.callbacks.get(id);
      if (callback) {
        callback(result);
        this.callbacks.delete(id);
      }
    };

    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
    };
  }

  processData<T>(data: any, options?: any): Promise<T> {
    return this.postMessage('processData', { data, options });
  }

  calculateMetrics<T>(data: any, metrics: string[]): Promise<T> {
    return this.postMessage('calculateMetrics', { data, metrics });
  }

  optimize<T>(data: any, optimizationConfig: any): Promise<T> {
    return this.postMessage('optimize', { data, optimizationConfig });
  }

  private postMessage<T>(type: string, data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      
      this.callbacks.set(id, resolve);
      
      const message: WorkerMessage = { type: type as any, data, id };
      
      try {
        this.worker.postMessage(message);
      } catch (error) {
        this.callbacks.delete(id);
        reject(error);
      }

      // 设置超时
      setTimeout(() => {
        if (this.callbacks.has(id)) {
          this.callbacks.delete(id);
          reject(new Error('Worker operation timed out'));
        }
      }, 30000);
    });
  }

  terminate() {
    this.worker.terminate();
    this.callbacks.clear();
  }
}

export const workerManager = ChartWorkerManager.getInstance(); 