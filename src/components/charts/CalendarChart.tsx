import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { HeatmapChart, ScatterChart } from 'echarts/charts';
import {
  TooltipComponent,
  VisualMapComponent,
  CalendarComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  CalendarComponent,
  HeatmapChart,
  ScatterChart,
  CanvasRenderer
]);

interface CalendarData {
  date: string;
  value: number;
}

interface CalendarChartProps {
  data: CalendarData[];
  title?: string;
  year: number;
}

const CalendarChart: React.FC<CalendarChartProps> = ({ data, title, year }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const maxValue = Math.max(...data.map(item => item.value));

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          formatter: (params: any) => {
            return `${params.value[0]}<br/>支出: ${formatCurrency(params.value[1])}`;
          }
        },
        visualMap: {
          min: 0,
          max: maxValue,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          top: 'top',
          inRange: {
            color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
          }
        },
        calendar: {
          top: 80,
          left: 30,
          right: 30,
          cellSize: ['auto', 13],
          range: year,
          itemStyle: {
            borderWidth: 0.5
          },
          yearLabel: { show: false }
        },
        series: [{
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: data.map(item => [item.date, item.value])
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, year]);

  return <div ref={chartRef} style={{ height: '200px', width: '100%' }} />;
};

export default CalendarChart; 