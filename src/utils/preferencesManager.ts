interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    enabled: boolean;
    types: {
      budget: boolean;
      reminder: boolean;
      sync: boolean;
    };
  };
  privacy: {
    autoLock: boolean;
    lockTimeout: number;
    dataEncryption: boolean;
  };
  display: {
    compactMode: boolean;
    animations: boolean;
    defaultView: 'daily' | 'weekly' | 'monthly';
  };
}

export class PreferencesManager {
  private static instance: PreferencesManager;
  private preferences: Map<string, UserPreferences> = new Map();
  private readonly STORAGE_KEY = 'user_preferences';
  private listeners: Map<string, Set<(prefs: UserPreferences) => void>> = new Map();

  private readonly DEFAULT_PREFERENCES: UserPreferences = {
    theme: 'system',
    language: 'zh-CN',
    currency: 'CNY',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    notifications: {
      enabled: true,
      types: {
        budget: true,
        reminder: true,
        sync: true
      }
    },
    privacy: {
      autoLock: false,
      lockTimeout: 5,
      dataEncryption: false
    },
    display: {
      compactMode: false,
      animations: true,
      defaultView: 'monthly'
    }
  };

  static getInstance() {
    if (!PreferencesManager.instance) {
      PreferencesManager.instance = new PreferencesManager();
    }
    return PreferencesManager.instance;
  }

  async loadPreferences(userId: string): Promise<UserPreferences> {
    if (!this.preferences.has(userId)) {
      const stored = localStorage.getItem(`${this.STORAGE_KEY}_${userId}`);
      const prefs = stored 
        ? JSON.parse(stored)
        : { ...this.DEFAULT_PREFERENCES };
      this.preferences.set(userId, prefs);
    }
    return this.preferences.get(userId)!;
  }

  async updatePreferences(
    userId: string,
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const current = await this.loadPreferences(userId);
    const updated = this.deepMerge(current, updates);
    
    this.preferences.set(userId, updated);
    localStorage.setItem(
      `${this.STORAGE_KEY}_${userId}`,
      JSON.stringify(updated)
    );
    
    this.notifyListeners(userId, updated);
    return updated;
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

  resetPreferences(userId: string) {
    this.preferences.set(userId, { ...this.DEFAULT_PREFERENCES });
    localStorage.removeItem(`${this.STORAGE_KEY}_${userId}`);
    this.notifyListeners(userId, this.DEFAULT_PREFERENCES);
  }

  onPreferencesChanged(
    userId: string,
    listener: (prefs: UserPreferences) => void
  ) {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    this.listeners.get(userId)!.add(listener);
    return () => this.listeners.get(userId)?.delete(listener);
  }

  private notifyListeners(userId: string, prefs: UserPreferences) {
    this.listeners.get(userId)?.forEach(listener => listener(prefs));
  }
}

export const preferencesManager = PreferencesManager.getInstance(); 