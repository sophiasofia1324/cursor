import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { ScatterChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer
]);

interface BubbleData {
  name: string;
  value: [number, number, number]; // [x, y, size]
  category: string;
}

interface BubbleChartProps {
  data: BubbleData[];
  title?: string;
  xAxisName?: string;
  yAxisName?: string;
}

const BubbleChart: React.FC<BubbleChartProps> = ({
  data,
  title,
  xAxisName,
  yAxisName
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const categories = [...new Set(data.map(item => item.category))];

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const { name, value, marker } = params;
            return `
              ${marker} ${name}<br/>
              ${xAxisName || 'X'}: ${formatCurrency(value[0])}<br/>
              ${yAxisName || 'Y'}: ${formatCurrency(value[1])}<br/>
              大小: ${value[2]}
            `;
          }
        },
        legend: {
          data: categories,
          bottom: 10
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '15%'
        },
        xAxis: {
          name: xAxisName,
          nameLocation: 'middle',
          nameGap: 30,
          scale: true
        },
        yAxis: {
          name: yAxisName,
          nameLocation: 'middle',
          nameGap: 30,
          scale: true
        },
        series: categories.map((category, index) => ({
          name: category,
          type: 'scatter',
          data: data.filter(item => item.category === category),
          symbolSize: (data: number[]) => Math.sqrt(data[2]) * 5,
          itemStyle: {
            color: CHART_COLORS[index % CHART_COLORS.length]
          },
          emphasis: {
            focus: 'series',
            label: {
              show: true,
              formatter: ({ data }: any) => data.name,
              position: 'top'
            }
          }
        }))
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, xAxisName, yAxisName]);

  return <div ref={chartRef} style={{ height: '400px', width: '100%' }} />;
};

export default BubbleChart; 