interface StyleConfig {
  theme: 'light' | 'dark';
  charts: string[];
  customStyles?: Record<string, string>;
}

export class ChartStyleLoader {
  private static instance: ChartStyleLoader;
  private loadedStyles: Set<string> = new Set();
  private styleCache: Map<string, string> = new Map();
  private currentTheme: 'light' | 'dark' = 'light';

  private constructor() {
    this.setupThemeObserver();
  }

  static getInstance() {
    if (!ChartStyleLoader.instance) {
      ChartStyleLoader.instance = new ChartStyleLoader();
    }
    return ChartStyleLoader.instance;
  }

  private setupThemeObserver() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      this.currentTheme = e.matches ? 'dark' : 'light';
      this.updateAllStyles();
    };
    
    mediaQuery.addEventListener('change', handleThemeChange);
  }

  async loadChartStyles(config: StyleConfig) {
    const { charts, theme, customStyles } = config;
    this.currentTheme = theme;

    const stylePromises = charts.map(chartType => 
      this.loadStyleForChart(chartType)
    );

    if (customStyles) {
      Object.entries(customStyles).forEach(([key, style]) => {
        this.styleCache.set(key, style);
      });
    }

    await Promise.all(stylePromises);
    this.updateAllStyles();
  }

  private async loadStyleForChart(chartType: string) {
    if (this.loadedStyles.has(chartType)) return;

    try {
      const style = await import(`../styles/charts/${chartType}.css`);
      this.styleCache.set(chartType, style.default);
      this.loadedStyles.add(chartType);
    } catch (error) {
      console.error(`Failed to load style for ${chartType}:`, error);
    }
  }

  private updateAllStyles() {
    const styleElement = document.getElementById('chart-styles') || 
                        document.createElement('style');
    styleElement.id = 'chart-styles';

    const styles = Array.from(this.loadedStyles)
      .map(chartType => {
        const baseStyle = this.styleCache.get(chartType) || '';
        const themeStyle = this.styleCache.get(`${chartType}-${this.currentTheme}`) || '';
        return `${baseStyle}\n${themeStyle}`;
      })
      .join('\n');

    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  unloadChartStyles(chartTypes: string[]) {
    chartTypes.forEach(chartType => {
      this.loadedStyles.delete(chartType);
      this.styleCache.delete(chartType);
      this.styleCache.delete(`${chartType}-light`);
      this.styleCache.delete(`${chartType}-dark`);
    });
    this.updateAllStyles();
  }
} 