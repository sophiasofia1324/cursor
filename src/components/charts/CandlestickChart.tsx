import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { CandlestickChart as EChartsCandlestick } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  LegendComponent,
  EChartsCandlestick,
  CanvasRenderer
]);

interface CandlestickChartProps {
  data: Array<{
    date: string;
    values: [number, number, number, number]; // [open, close, low, high]
  }>;
  title?: string;
  height?: number;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  title = '蜡烛图',
  height = 400
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    const option = {
      title: {
        text: title,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.date),
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitNumber: 20
      },
      yAxis: {
        scale: true,
        splitLine: { show: true }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100
        },
        {
          show: true,
          type: 'slider',
          bottom: '5%',
          start: 50,
          end: 100
        }
      ],
      series: [
        {
          name: '价格',
          type: 'candlestick',
          data: data.map(item => item.values),
          itemStyle: {
            color: CHART_COLORS[0], // 上涨颜色
            color0: CHART_COLORS[3], // 下跌颜色
            borderColor: CHART_COLORS[0],
            borderColor0: CHART_COLORS[3]
          }
        }
      ]
    };

    chartInstance.current.setOption(option);

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title]);

  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
};

export default CandlestickChart; 