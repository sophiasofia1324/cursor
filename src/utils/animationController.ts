// 统一管理和控制图表动画效果 

interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
  threshold?: number;
}

export class ChartAnimationController {
  private static instance: ChartAnimationController;
  private animations: Map<string, AnimationConfig> = new Map();
  private defaultConfig: Required<AnimationConfig> = {
    duration: 1000,
    easing: 'cubicOut',
    delay: 0,
    threshold: 2000
  };

  static getInstance() {
    if (!ChartAnimationController.instance) {
      ChartAnimationController.instance = new ChartAnimationController();
    }
    return ChartAnimationController.instance;
  }

  setAnimation(chartId: string, config: AnimationConfig) {
    this.animations.set(chartId, { ...this.defaultConfig, ...config });
  }

  getAnimation(chartId: string): Required<AnimationConfig> {
    return { ...this.defaultConfig, ...this.animations.get(chartId) };
  }

  optimizeAnimation(chartId: string, dataSize: number) {
    const config = this.getAnimation(chartId);
    if (dataSize > config.threshold) {
      return {
        ...config,
        duration: Math.max(200, config.duration / 2),
        delay: 0
      };
    }
    return config;
  }

  clearAnimation(chartId: string) {
    this.animations.delete(chartId);
  }
}

export const animationController = ChartAnimationController.getInstance(); 