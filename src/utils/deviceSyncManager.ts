import { v4 as uuidv4 } from 'uuid';

interface DeviceInfo {
  id: string;
  name: string;
  lastSync: number;
}

interface SyncData {
  deviceId: string;
  timestamp: number;
  data: any;
  type: string;
}

export class DeviceSyncManager {
  private static instance: DeviceSyncManager;
  private deviceId: string;
  private syncInterval: number = 5 * 60 * 1000; // 5分钟
  private knownDevices: Map<string, DeviceInfo> = new Map();
  private pendingSync: Map<string, SyncData[]> = new Map();

  private constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.setupAutoSync();
  }

  static getInstance() {
    if (!DeviceSyncManager.instance) {
      DeviceSyncManager.instance = new DeviceSyncManager();
    }
    return DeviceSyncManager.instance;
  }

  private getOrCreateDeviceId(): string {
    let id = localStorage.getItem('device_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('device_id', id);
    }
    return id;
  }

  private setupAutoSync() {
    setInterval(() => this.sync(), this.syncInterval);
    window.addEventListener('online', () => this.sync());
  }

  async registerDevice(name: string = `Device-${Math.random().toString(36).substr(2, 4)}`) {
    const deviceInfo: DeviceInfo = {
      id: this.deviceId,
      name,
      lastSync: Date.now()
    };

    await this.updateDeviceRegistry(deviceInfo);
    return deviceInfo;
  }

  private async updateDeviceRegistry(deviceInfo: DeviceInfo) {
    try {
      const response = await fetch('/api/devices/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceInfo)
      });

      if (response.ok) {
        const devices = await response.json();
        devices.forEach((device: DeviceInfo) => {
          this.knownDevices.set(device.id, device);
        });
      }
    } catch (error) {
      console.error('Failed to update device registry:', error);
    }
  }

  async sync() {
    if (!navigator.onLine) return;

    try {
      // 获取其他设备的更新
      const updates = await this.fetchUpdates();
      
      // 应用更新
      for (const update of updates) {
        await this.applyUpdate(update);
      }

      // 发送本地更新
      const pendingData = this.pendingSync.get(this.deviceId) || [];
      if (pendingData.length > 0) {
        await this.pushUpdates(pendingData);
        this.pendingSync.delete(this.deviceId);
      }

    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private async fetchUpdates(): Promise<SyncData[]> {
    const response = await fetch(`/api/sync/updates?deviceId=${this.deviceId}`);
    return response.json();
  }

  private async pushUpdates(updates: SyncData[]) {
    await fetch('/api/sync/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  }

  private async applyUpdate(update: SyncData) {
    // 根据更新类型应用不同的更新逻辑
    switch (update.type) {
      case 'expense':
        await this.applyExpenseUpdate(update.data);
        break;
      case 'budget':
        await this.applyBudgetUpdate(update.data);
        break;
      // ... 其他类型的更新
    }
  }

  private async applyExpenseUpdate(data: any) {
    // 实现具体的更新逻辑
  }

  private async applyBudgetUpdate(data: any) {
    // 实现具体的更新逻辑
  }

  queueUpdate(type: string, data: any) {
    if (!this.pendingSync.has(this.deviceId)) {
      this.pendingSync.set(this.deviceId, []);
    }

    this.pendingSync.get(this.deviceId)!.push({
      deviceId: this.deviceId,
      timestamp: Date.now(),
      type,
      data
    });
  }

  generateSyncLink(): string {
    const syncData = {
      deviceId: this.deviceId,
      timestamp: Date.now()
    };

    const encoded = btoa(JSON.stringify(syncData));
    return `${window.location.origin}/sync?data=${encoded}`;
  }

  async processSyncLink(link: string) {
    const urlParams = new URLSearchParams(new URL(link).search);
    const encodedData = urlParams.get('data');
    if (!encodedData) return;

    const syncData = JSON.parse(atob(encodedData));
    await this.registerDevice();
    await this.sync();
  }
}

export const deviceSyncManager = DeviceSyncManager.getInstance(); 