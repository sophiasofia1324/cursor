// 图表初始化工具
export const initChart = (
  container: HTMLElement,
  theme?: 'light' | 'dark'
) => {
  const chart: any = {};
  return chart;
};

// 内存管理工具
export const disposeChart = (chart: any) => {
  if (chart) {
    chart.dispose?.();
  }
};

// 删除 echarts 相关代码,改用 any 类型
type ChartInstance = any; 