interface ColorScheme {
  primary: string[];
  accent: string[];
  neutral: string[];
}

export class ChartThemeGenerator {
  private static instance: ChartThemeGenerator;
  private colorSchemes: Map<string, ColorScheme> = new Map();

  static getInstance() {
    if (!ChartThemeGenerator.instance) {
      ChartThemeGenerator.instance = new ChartThemeGenerator();
      ChartThemeGenerator.instance.initDefaultSchemes();
    }
    return ChartThemeGenerator.instance;
  }

  private initDefaultSchemes() {
    this.colorSchemes.set('default', {
      primary: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
      accent: ['#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
      neutral: ['#333', '#666', '#999', '#ccc']
    });

    this.colorSchemes.set('dark', {
      primary: ['#4992ff', '#7cba59', '#fac858', '#ff7070', '#73c0de'],
      accent: ['#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
      neutral: ['#eee', '#ccc', '#999', '#666']
    });
  }

  generateTheme(name: string, baseColors: string[]) {
    const colors = this.generateColorPalette(baseColors);
    return {
      name,
      colors,
      backgroundColor: this.adjustColor(colors[0], 0.1),
      textStyle: {
        color: this.getContrastColor(colors[0])
      },
      axisLine: {
        lineStyle: {
          color: this.adjustColor(colors[0], 0.3)
        }
      }
    };
  }

  private generateColorPalette(baseColors: string[]): string[] {
    const palette: string[] = [];
    baseColors.forEach(color => {
      palette.push(color);
      palette.push(this.adjustColor(color, 0.8));
      palette.push(this.adjustColor(color, 1.2));
    });
    return palette;
  }

  private adjustColor(color: string, factor: number): string {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;

    const adjusted = rgb.map(c => Math.min(255, Math.max(0, Math.round(c * factor))));
    return this.rgbToHex(adjusted[0], adjusted[1], adjusted[2]);
  }

  private getContrastColor(backgroundColor: string): string {
    const rgb = this.hexToRgb(backgroundColor);
    if (!rgb) return '#000000';

    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  private hexToRgb(hex: string): number[] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }
}

export const themeGenerator = ChartThemeGenerator.getInstance(); 