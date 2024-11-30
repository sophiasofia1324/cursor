interface Resource {
  type: 'image' | 'style' | 'script' | 'data';
  url: string;
  size: number;
  lastAccess: number;
  loading?: boolean;
  error?: Error;
}

export class ChartResourceManager {
  private static instance: ChartResourceManager;
  private resources: Map<string, Resource> = new Map();
  private loadingQueue: Set<string> = new Set();
  private maxConcurrentLoads = 3;
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private currentCacheSize = 0;

  static getInstance() {
    if (!ChartResourceManager.instance) {
      ChartResourceManager.instance = new ChartResourceManager();
    }
    return ChartResourceManager.instance;
  }

  async loadResource(url: string, type: Resource['type']): Promise<any> {
    const existingResource = this.resources.get(url);
    if (existingResource) {
      existingResource.lastAccess = Date.now();
      return this.getResourceContent(existingResource);
    }

    while (this.loadingQueue.size >= this.maxConcurrentLoads) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.loadingQueue.add(url);

    try {
      const resource = await this.fetchResource(url, type);
      this.addToCache(url, resource);
      return this.getResourceContent(resource);
    } finally {
      this.loadingQueue.delete(url);
    }
  }

  private async fetchResource(url: string, type: Resource['type']): Promise<Resource> {
    try {
      let content;
      let size = 0;

      switch (type) {
        case 'image':
          content = await this.loadImage(url);
          size = await this.getImageSize(content);
          break;
        case 'style':
          content = await fetch(url).then(r => r.text());
          size = new Blob([content]).size;
          break;
        case 'script':
          content = await import(/* @vite-ignore */ url);
          size = JSON.stringify(content).length;
          break;
        case 'data':
          content = await fetch(url).then(r => r.json());
          size = JSON.stringify(content).length;
          break;
      }

      return {
        type,
        url,
        size,
        content,
        lastAccess: Date.now()
      };
    } catch (error) {
      console.error(`Failed to load resource: ${url}`, error);
      throw error;
    }
  }

  private async loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  private async getImageSize(img: HTMLImageElement): Promise<number> {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        resolve(blob?.size || 0);
      });
    });
  }

  private addToCache(url: string, resource: Resource) {
    while (this.currentCacheSize + resource.size > this.maxCacheSize) {
      this.evictOldestResource();
    }

    this.resources.set(url, resource);
    this.currentCacheSize += resource.size;
  }

  private evictOldestResource() {
    let oldest: [string, Resource] | null = null;
    for (const [url, resource] of this.resources.entries()) {
      if (!oldest || resource.lastAccess < oldest[1].lastAccess) {
        oldest = [url, resource];
      }
    }

    if (oldest) {
      const [url, resource] = oldest;
      this.resources.delete(url);
      this.currentCacheSize -= resource.size;
    }
  }

  private getResourceContent(resource: Resource): any {
    resource.lastAccess = Date.now();
    return resource.content;
  }

  clearCache() {
    this.resources.clear();
    this.currentCacheSize = 0;
  }

  getResourceStats() {
    return {
      totalSize: this.currentCacheSize,
      resourceCount: this.resources.size,
      loadingCount: this.loadingQueue.size
    };
  }
} 