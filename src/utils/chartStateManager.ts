interface ChartState {
  data: any;
  options: any;
  interactions: Set<string>;
  animations: boolean;
  lastUpdate: number;
}

export class ChartStateManager {
  private static instance: ChartStateManager;
  private states: Map<string, ChartState> = new Map();
  private stateHistory: Map<string, ChartState[]> = new Map();
  private maxHistoryLength = 10;

  static getInstance() {
    if (!ChartStateManager.instance) {
      ChartStateManager.instance = new ChartStateManager();
    }
    return ChartStateManager.instance;
  }

  saveState(chartId: string, state: Partial<ChartState>) {
    const currentState = this.states.get(chartId) || {
      data: null,
      options: {},
      interactions: new Set(),
      animations: true,
      lastUpdate: Date.now()
    };

    const newState = { ...currentState, ...state, lastUpdate: Date.now() };
    this.states.set(chartId, newState);

    // 保存历史记录
    const history = this.stateHistory.get(chartId) || [];
    history.push({ ...newState });
    if (history.length > this.maxHistoryLength) {
      history.shift();
    }
    this.stateHistory.set(chartId, history);
  }

  getState(chartId: string): ChartState | null {
    return this.states.get(chartId) || null;
  }

  undo(chartId: string): ChartState | null {
    const history = this.stateHistory.get(chartId) || [];
    if (history.length <= 1) return null;

    history.pop(); // 移除当前状态
    const previousState = history[history.length - 1];
    this.states.set(chartId, { ...previousState });
    return previousState;
  }

  clearState(chartId: string) {
    this.states.delete(chartId);
    this.stateHistory.delete(chartId);
  }
} 