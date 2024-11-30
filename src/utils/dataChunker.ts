interface ChunkConfig {
  chunkSize?: number;
  maxParallelChunks?: number;
  processingDelay?: number;
}

export class DataChunkProcessor {
  private static instance: DataChunkProcessor;
  private config: Required<ChunkConfig>;
  private processingQueue: Map<string, boolean> = new Map();

  private constructor(config: ChunkConfig = {}) {
    this.config = {
      chunkSize: 1000,
      maxParallelChunks: 3,
      processingDelay: 16,
      ...config
    };
  }

  static getInstance(config?: ChunkConfig) {
    if (!DataChunkProcessor.instance) {
      DataChunkProcessor.instance = new DataChunkProcessor(config);
    }
    return DataChunkProcessor.instance;
  }

  async processInChunks<T, R>(
    data: T[],
    processor: (chunk: T[]) => Promise<R[]>,
    onProgress?: (progress: number) => void
  ): Promise<R[]> {
    const chunks = this.splitIntoChunks(data);
    const results: R[] = [];
    let processedChunks = 0;

    const processChunk = async (chunk: T[]) => {
      const result = await processor(chunk);
      results.push(...result);
      processedChunks++;
      
      if (onProgress) {
        onProgress((processedChunks / chunks.length) * 100);
      }
    };

    // 并行处理chunks
    for (let i = 0; i < chunks.length; i += this.config.maxParallelChunks) {
      const batch = chunks.slice(i, i + this.config.maxParallelChunks);
      await Promise.all(batch.map(chunk => processChunk(chunk)));
      
      // 添加延迟以避免阻塞UI
      if (i + this.config.maxParallelChunks < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, this.config.processingDelay));
      }
    }

    return results;
  }

  private splitIntoChunks<T>(data: T[]): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < data.length; i += this.config.chunkSize) {
      chunks.push(data.slice(i, i + this.config.chunkSize));
    }
    return chunks;
  }

  async processStreamInChunks<T, R>(
    stream: ReadableStream<T>,
    processor: (chunk: T[]) => Promise<R[]>,
    onProgress?: (progress: number) => void
  ): Promise<R[]> {
    const reader = stream.getReader();
    const chunks: T[][] = [];
    const results: R[] = [];
    let currentChunk: T[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        currentChunk.push(value);
        if (currentChunk.length >= this.config.chunkSize) {
          chunks.push([...currentChunk]);
          currentChunk = [];
        }
      }

      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }

      let processedChunks = 0;
      for (const chunk of chunks) {
        const result = await processor(chunk);
        results.push(...result);
        processedChunks++;
        
        if (onProgress) {
          onProgress((processedChunks / chunks.length) * 100);
        }

        await new Promise(resolve => setTimeout(resolve, this.config.processingDelay));
      }

      return results;
    } finally {
      reader.releaseLock();
    }
  }
} 