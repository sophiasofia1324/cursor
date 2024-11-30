import { debounce } from 'lodash';

// 基础配置
export const BASE_CHART_CONFIG = {
  animation: true,
  animationDuration: 1000,
  animationEasing: 'cubicInOut',
  animationThreshold: 2000,
  progressiveThreshold: 3000,
  progressive: 200,
  hoverLayerThreshold: 3000,
  useUTC: true
};

// 防抖配置
export const RESIZE_DELAY = 100;
export const createResizeHandler = (chart: any) => 
  debounce(() => chart?.resize(), RESIZE_DELAY);

// 主题配置
export const LIGHT_THEME = {
  backgroundColor: '#ffffff',
  textStyle: {
    color: '#333333'
  },
  title: {
    textStyle: {
      color: '#333333'
    }
  },
  // ...其他主题配置
};

export const DARK_THEME = {
  backgroundColor: '#1f1f1f',
  textStyle: {
    color: '#ffffff'
  },
  title: {
    textStyle: {
      color: '#ffffff'
    }
  },
  // ...其他主题配置
}; 