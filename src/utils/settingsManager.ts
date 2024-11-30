interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    enabled: boolean;
    budget: boolean;
    goals: boolean;
    backups: boolean;
  };
  privacy: {
    encryptData: boolean;
    autoLock: boolean;
    lockTimeout: number;
  };
  display: {
    compactMode: boolean;
    showDecimals: boolean;
    defaultView: 'daily' | 'weekly' | 'monthly';
  };
  sync: {
    autoSync: boolean;
    syncInterval: number;
    syncOnCellular: boolean;
  };
}

export class SettingsManager {
  private static instance: SettingsManager;
  private settings: AppSettings;
  private readonly STORAGE_KEY = 'app_settings';
  private listeners: Set<(settings: AppSettings) => void> = new Set();

  private readonly DEFAULT_SETTINGS: AppSettings = {
    theme: 'system',
    language: 'zh-CN',
    currency: 'CNY',
    notifications: {
      enabled: true,
      budget: true,
      goals: true,
      backups: true
    },
    privacy: {
      encryptData: false,
      autoLock: false,
      lockTimeout: 5
    },
    display: {
      compactMode: false,
      showDecimals: true,
      defaultView: 'monthly'
    },
    sync: {
      autoSync: true,
      syncInterval: 5,
      syncOnCellular: false
    }
  };

  private constructor() {
    this.settings = this.loadSettings();
  }

  static getInstance() {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  private loadSettings(): AppSettings {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return this.DEFAULT_SETTINGS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return this.DEFAULT_SETTINGS;
    }
  }

  private saveSettings() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    this.notifyListeners();
  }

  updateSettings(updates: Partial<AppSettings>) {
    this.settings = this.deepMerge(this.settings, updates);
    this.saveSettings();
  }

  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  resetSettings() {
    this.settings = { ...this.DEFAULT_SETTINGS };
    this.saveSettings();
  }

  subscribe(listener: (settings: AppSettings) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.settings));
  }

  private deepMerge<T>(target: T, source: Partial<T>): T {
    const result = { ...target };
    for (const key in source) {
      const value = source[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.deepMerge(result[key], value);
      } else {
        result[key] = value as any;
      }
    }
    return result;
  }
}

export const settingsManager = SettingsManager.getInstance(); 