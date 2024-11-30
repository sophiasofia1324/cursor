import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { Scatter3DChart } from 'echarts-gl';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  Scatter3DChart,
  CanvasRenderer
]);

/**
 * ThreeDimensionalChart 组件
 * 渲染一个 3D 散点图
 */
const ThreeDimensionalChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      const option = {
        // 配置图表选项
      };
      chartInstance.current.setOption(option);
    }
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default ThreeDimensionalChart; 