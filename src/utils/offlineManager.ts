// @ts-ignore
import { openDB } from 'idb';

interface OfflineData {
  id: string;
  type: 'expense' | 'budget' | 'category';
  data: any;
  timestamp: number;
  synced: boolean;
}

// 添加类型定义
type IDBPDatabase = any;

export class OfflineManager {
  private static instance: OfflineManager;
  private db: IDBPDatabase | null = null;
  private syncQueue: Set<string> = new Set();

  static getInstance() {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  async init() {
    this.db = await openDB('expense-tracker', 1, {
      upgrade(db) {
        db.createObjectStore('offlineData', { keyPath: 'id' });
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }
    });
    this.setupSync();
  }

  async saveData(type: OfflineData['type'], data: any) {
    if (!this.db) await this.init();

    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id,
      type,
      data,
      timestamp: Date.now(),
      synced: false
    };

    await this.db!.put('offlineData', offlineData);
    this.syncQueue.add(id);
    this.triggerSync();
  }

  async getData(type: OfflineData['type']) {
    if (!this.db) await this.init();

    const all = await this.db!.getAll('offlineData');
    return all.filter(item => item.type === type).map(item => item.data);
  }

  private setupSync() {
    window.addEventListener('online', () => this.triggerSync());
    setInterval(() => {
      if (navigator.onLine) this.triggerSync();
    }, 5 * 60 * 1000); // 每5分钟尝试同步
  }

  private async triggerSync() {
    if (!navigator.onLine || this.syncQueue.size === 0) return;

    const toSync = Array.from(this.syncQueue);
    for (const id of toSync) {
      try {
        const data = await this.db!.get('offlineData', id);
        if (data && !data.synced) {
          await this.syncToServer(data);
          data.synced = true;
          await this.db!.put('offlineData', data);
          this.syncQueue.delete(id);
        }
      } catch (error) {
        console.error('Sync failed for:', id, error);
      }
    }
  }

  private async syncToServer(data: OfflineData) {
    // 实现与服务器同步的逻辑
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Sync failed');
    }
  }

  async cleanup(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30天
    if (!this.db) await this.init();

    const now = Date.now();
    const all = await this.db!.getAll('offlineData');
    
    for (const item of all) {
      if (item.synced && now - item.timestamp > maxAge) {
        await this.db!.delete('offlineData', item.id);
      }
    }
  }

  async export() {
    if (!this.db) await this.init();

    const data = await this.db!.getAll('offlineData');
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    return URL.createObjectURL(blob);
  }

  async import(file: File) {
    if (!this.db) await this.init();

    const text = await file.text();
    const data: OfflineData[] = JSON.parse(text);
    
    await Promise.all(
      data.map(item => this.db!.put('offlineData', item))
    );
  }
}

export const offlineManager = OfflineManager.getInstance(); 