type SyncCallback = (data: any) => void;

export class ChartDataSynchronizer {
  private static instance: ChartDataSynchronizer;
  private syncGroups: Map<string, Set<string>> = new Map();
  private callbacks: Map<string, Set<SyncCallback>> = new Map();

  static getInstance() {
    if (!ChartDataSynchronizer.instance) {
      ChartDataSynchronizer.instance = new ChartDataSynchronizer();
    }
    return ChartDataSynchronizer.instance;
  }

  createSyncGroup(groupId: string, chartIds: string[]) {
    this.syncGroups.set(groupId, new Set(chartIds));
    chartIds.forEach(chartId => {
      if (!this.callbacks.has(chartId)) {
        this.callbacks.set(chartId, new Set());
      }
    });
  }

  addToGroup(groupId: string, chartId: string) {
    const group = this.syncGroups.get(groupId);
    if (group) {
      group.add(chartId);
      if (!this.callbacks.has(chartId)) {
        this.callbacks.set(chartId, new Set());
      }
    }
  }

  removeFromGroup(groupId: string, chartId: string) {
    const group = this.syncGroups.get(groupId);
    if (group) {
      group.delete(chartId);
    }
  }

  onSync(chartId: string, callback: SyncCallback) {
    const callbacks = this.callbacks.get(chartId);
    if (callbacks) {
      callbacks.add(callback);
    }
  }

  sync(sourceChartId: string, data: any) {
    for (const [groupId, charts] of this.syncGroups) {
      if (charts.has(sourceChartId)) {
        charts.forEach(chartId => {
          if (chartId !== sourceChartId) {
            const callbacks = this.callbacks.get(chartId);
            callbacks?.forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                console.error(`Sync error for chart ${chartId}:`, error);
              }
            });
          }
        });
      }
    }
  }

  clearSync(groupId?: string) {
    if (groupId) {
      this.syncGroups.delete(groupId);
    } else {
      this.syncGroups.clear();
      this.callbacks.clear();
    }
  }
}

export const dataSynchronizer = ChartDataSynchronizer.getInstance(); 