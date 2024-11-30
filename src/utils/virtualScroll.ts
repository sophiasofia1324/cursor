import { debounce } from 'lodash';

interface VirtualScrollConfig {
  itemHeight: number;
  overscan?: number;
  containerHeight?: number;
  debounceTime?: number;
}

export class VirtualScrollManager {
  private static instance: VirtualScrollManager;
  private config: Required<VirtualScrollConfig>;
  private scrollContainers: Map<string, HTMLElement> = new Map();
  private itemPositions: Map<string, number[]> = new Map();
  private isMonitoring: Map<string, boolean> = new Map();

  private constructor(config: VirtualScrollConfig) {
    this.config = {
      overscan: 5,
      containerHeight: 400,
      debounceTime: 100,
      ...config
    };
  }

  static getInstance(config?: VirtualScrollConfig) {
    if (!VirtualScrollManager.instance && config) {
      VirtualScrollManager.instance = new VirtualScrollManager(config);
    }
    return VirtualScrollManager.instance;
  }

  registerContainer(id: string, container: HTMLElement) {
    this.scrollContainers.set(id, container);
    this.setupScrollListener(id, container);
  }

  private setupScrollListener(id: string, container: HTMLElement) {
    const handleScroll = debounce(() => {
      const scrollTop = container.scrollTop;
      const visibleRange = this.calculateVisibleRange(id, scrollTop);
      this.updateVisibleItems(id, visibleRange);
    }, this.config.debounceTime);

    container.addEventListener('scroll', handleScroll);
  }

  private calculateVisibleRange(id: string, scrollTop: number) {
    const { itemHeight, overscan } = this.config;
    const positions = this.itemPositions.get(id) || [];
    
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      positions.length - 1,
      Math.ceil((scrollTop + this.config.containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }

  private updateVisibleItems(id: string, range: { startIndex: number; endIndex: number }) {
    const container = this.scrollContainers.get(id);
    if (!container) return;

    // 更新可见项的位置和显示状态
    const items = Array.from(container.children) as HTMLElement[];
    items.forEach((item, index) => {
      if (index >= range.startIndex && index <= range.endIndex) {
        item.style.display = '';
        item.style.transform = `translateY(${index * this.config.itemHeight}px)`;
      } else {
        item.style.display = 'none';
      }
    });
  }

  setItemPositions(id: string, positions: number[]) {
    this.itemPositions.set(id, positions);
  }

  getVisibleItems(id: string): number[] {
    const container = this.scrollContainers.get(id);
    if (!container) return [];

    const scrollTop = container.scrollTop;
    const range = this.calculateVisibleRange(id, scrollTop);
    
    return Array.from(
      { length: range.endIndex - range.startIndex + 1 },
      (_, i) => range.startIndex + i
    );
  }

  cleanup(id: string) {
    const container = this.scrollContainers.get(id);
    if (container) {
      container.removeEventListener('scroll', () => {});
      this.scrollContainers.delete(id);
      this.itemPositions.delete(id);
    }
  }
} 