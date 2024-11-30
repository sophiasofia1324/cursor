import React, { useEffect, useRef, useState } from 'react';
import { performanceMonitor } from '../../utils/performanceMonitor';
import { toast } from 'react-hot-toast';

interface PerformanceOptimizationProps {
  onPerformancePoor?: () => void;
  optimizationLevel?: 'low' | 'medium' | 'high';
}

type ChartOption = any;
type EChartsInstance = {
  getOption?: () => ChartOption;
  setOption?: (option: ChartOption) => void;
};

export const withPerformanceOptimization = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: PerformanceOptimizationProps = {}
) => {
  return React.memo((props: P) => {
    const [isOptimized, setIsOptimized] = useState(false);
    const chartInstance = useRef<EChartsInstance>();

    useEffect(() => {
      if (chartInstance.current) {
        performanceMonitor.startMonitoring(chartInstance.current);

        const checkPerformance = setInterval(() => {
          if (performanceMonitor.isPerformancePoor()) {
            applyOptimizations();
            options.onPerformancePoor?.();
          }
        }, 5000);

        return () => {
          clearInterval(checkPerformance);
          performanceMonitor.stopMonitoring();
        };
      }
    }, []);

    const applyOptimizations = () => {
      if (isOptimized || !chartInstance.current) return;

      const option = chartInstance.current.getOption();
      const optimizationLevel = options.optimizationLevel || 'medium';

      switch (optimizationLevel) {
        case 'low':
          // 基础优化
          option.animation = false;
          break;
        case 'medium':
          // 中等优化
          option.animation = false;
          option.progressive = 500;
          option.progressiveThreshold = 3000;
          break;
        case 'high':
          // 高级优化
          option.animation = false;
          option.progressive = 1000;
          option.progressiveThreshold = 5000;
          option.series.forEach((series: any) => {
            if (series.symbolSize > 4) {
              series.symbolSize = 4;
            }
            if (series.lineStyle?.width > 1) {
              series.lineStyle.width = 1;
            }
          });
          break;
      }

      chartInstance.current.setOption(option);
      setIsOptimized(true);
      toast.success('已应用性能优化');
    };

    return (
      <WrappedComponent
        {...props}
        ref={(chart: any) => {
          chartInstance.current = chart?.getEchartsInstance?.();
        }}
      />
    );
  });
}; 