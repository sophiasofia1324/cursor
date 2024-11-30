import React, { useEffect, useRef } from 'react';
import { createResizeHandler } from '../../config/chartConfig';
import { initChart, disposeChart } from '../../utils/chartUtils';

export const withChartOptimization = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  chartOptions: {
    enableResize?: boolean;
    enableTheme?: boolean;
    enableCache?: boolean;
  } = {}
) => {
  return React.memo((props: P) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.ECharts>();

    useEffect(() => {
      if (chartRef.current && !chartInstance.current) {
        chartInstance.current = initChart(
          chartRef.current,
          props.theme
        );
      }

      if (chartOptions.enableResize) {
        const handleResize = createResizeHandler(chartInstance.current);
        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
          handleResize.cancel();
        };
      }
    }, []);

    useEffect(() => {
      return () => {
        disposeChart(chartInstance.current);
      };
    }, []);

    return <WrappedComponent {...props} chartRef={chartRef} chartInstance={chartInstance} />;
  });
}; 