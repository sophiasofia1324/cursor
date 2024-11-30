interface AnimationConfig {
  duration?: number;
  easing?: string;
  threshold?: number;
  delay?: number | ((idx: number) => number);
}

export class ChartAnimationOptimizer {
  private static readonly DURATION_THRESHOLD = 1000;
  private static readonly DATA_THRESHOLD = 1000;

  static optimizeAnimation(
    option: any,
    dataSize: number,
    config: AnimationConfig = {}
  ) {
    const {
      duration = 1000,
      easing = 'cubicOut',
      threshold = this.DATA_THRESHOLD,
      delay = (idx: number) => idx * 10
    } = config;

    // 数据量大时禁用动画
    if (dataSize > threshold) {
      option.animation = false;
      return option;
    }

    // 优化动画配置
    option.animation = true;
    option.animationThreshold = this.DURATION_THRESHOLD;
    option.animationDuration = duration;
    option.animationEasing = easing;
    option.animationDelay = typeof delay === 'function' ? delay : () => delay;

    // 优化系列动画
    if (option.series) {
      option.series.forEach((series: any) => {
        // 设置渐进式渲染
        if (dataSize > threshold / 2) {
          series.progressive = 200;
          series.progressiveThreshold = 500;
        }

        // 优化标记点和线的动画
        if (series.markPoint) {
          series.markPoint.animation = dataSize <= threshold / 4;
        }
        if (series.markLine) {
          series.markLine.animation = dataSize <= threshold / 4;
        }

        // 优化大数据量的散点图
        if (series.type === 'scatter' && dataSize > threshold / 2) {
          series.large = true;
          series.largeThreshold = 100;
        }
      });
    }

    return option;
  }

  static createSmartDelay(dataSize: number): (idx: number) => number {
    // 根据数据量动态调整延迟
    const baseDelay = Math.max(5, Math.min(20, 1000 / dataSize));
    return (idx: number) => {
      // 使用对数函数使延迟增长变缓
      return Math.floor(baseDelay * Math.log2(idx + 1));
    };
  }

  static optimizeForDataSize(option: any, dataSize: number) {
    if (dataSize > this.DATA_THRESHOLD) {
      // 大数据量优化
      return this.optimizeAnimation(option, dataSize, {
        duration: 500,
        threshold: this.DATA_THRESHOLD * 2,
        delay: 0
      });
    } else if (dataSize > this.DATA_THRESHOLD / 2) {
      // 中等数据量优化
      return this.optimizeAnimation(option, dataSize, {
        duration: 800,
        threshold: this.DATA_THRESHOLD,
        delay: this.createSmartDelay(dataSize)
      });
    }
    // 小数据量使用默认配置
    return this.optimizeAnimation(option, dataSize);
  }
} 