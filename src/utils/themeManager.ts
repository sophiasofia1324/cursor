interface ChartTheme {
  backgroundColor: string;
  textStyle: {
    color: string;
    fontSize: number;
    fontFamily: string;
  };
  title: {
    textStyle: {
      color: string;
      fontSize: number;
      fontWeight: string | number;
    };
  };
  legend: {
    textStyle: {
      color: string;
    };
    inactiveColor: string;
  };
  axis: {
    nameTextStyle: {
      color: string;
    };
    lineStyle: {
      color: string;
    };
    splitLine: {
      lineStyle: {
        color: string;
        type: string;
      };
    };
  };
  tooltip: {
    backgroundColor: string;
    borderColor: string;
    textStyle: {
      color: string;
    };
  };
  colors: string[];
}

export class ChartThemeManager {
  private static instance: ChartThemeManager;
  private themes: Map<string, ChartTheme> = new Map();
  private activeTheme: string = 'default';
  private themeListeners: Set<(theme: ChartTheme) => void> = new Set();

  private constructor() {
    this.setupSystemThemeListener();
    this.registerDefaultThemes();
  }

  static getInstance() {
    if (!ChartThemeManager.instance) {
      ChartThemeManager.instance = new ChartThemeManager();
    }
    return ChartThemeManager.instance;
  }

  private setupSystemThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', e => {
      this.setTheme(e.matches ? 'dark' : 'light');
    });
  }

  private registerDefaultThemes() {
    this.registerTheme('light', {
      backgroundColor: '#ffffff',
      textStyle: {
        color: '#333333',
        fontSize: 12,
        fontFamily: 'sans-serif'
      },
      title: {
        textStyle: {
          color: '#333333',
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      legend: {
        textStyle: {
          color: '#333333'
        },
        inactiveColor: '#ccc'
      },
      axis: {
        nameTextStyle: {
          color: '#666666'
        },
        lineStyle: {
          color: '#cccccc'
        },
        splitLine: {
          lineStyle: {
            color: '#eeeeee',
            type: 'dashed'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#cccccc',
        textStyle: {
          color: '#333333'
        }
      },
      colors: [
        '#5470c6',
        '#91cc75',
        '#fac858',
        '#ee6666',
        '#73c0de',
        '#3ba272',
        '#fc8452',
        '#9a60b4',
        '#ea7ccc'
      ]
    });

    this.registerTheme('dark', {
      backgroundColor: '#1f1f1f',
      textStyle: {
        color: '#ffffff',
        fontSize: 12,
        fontFamily: 'sans-serif'
      },
      title: {
        textStyle: {
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 'bold'
        }
      },
      legend: {
        textStyle: {
          color: '#ffffff'
        },
        inactiveColor: '#666'
      },
      axis: {
        nameTextStyle: {
          color: '#999999'
        },
        lineStyle: {
          color: '#333333'
        },
        splitLine: {
          lineStyle: {
            color: '#333333',
            type: 'dashed'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(50, 50, 50, 0.9)',
        borderColor: '#333333',
        textStyle: {
          color: '#ffffff'
        }
      },
      colors: [
        '#4992ff',
        '#7cba59',
        '#fac858',
        '#ff7070',
        '#73c0de',
        '#3ba272',
        '#fc8452',
        '#9a60b4',
        '#ea7ccc'
      ]
    });
  }

  registerTheme(name: string, theme: ChartTheme) {
    this.themes.set(name, theme);
  }

  setTheme(name: string) {
    if (!this.themes.has(name)) {
      console.warn(`Theme "${name}" not found, using default theme`);
      name = 'default';
    }

    this.activeTheme = name;
    const theme = this.getTheme();
    this.themeListeners.forEach(listener => listener(theme));
  }

  getTheme(): ChartTheme {
    return this.themes.get(this.activeTheme) || this.themes.get('light')!;
  }

  onThemeChange(listener: (theme: ChartTheme) => void) {
    this.themeListeners.add(listener);
    return () => this.themeListeners.delete(listener);
  }

  extendTheme(name: string, extension: Partial<ChartTheme>) {
    const baseTheme = this.themes.get(name);
    if (!baseTheme) {
      throw new Error(`Theme "${name}" not found`);
    }

    const newTheme = this.deepMerge(baseTheme, extension);
    this.registerTheme(`${name}-extended`, newTheme);
    return `${name}-extended`;
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

export const themeManager = ChartThemeManager.getInstance(); 