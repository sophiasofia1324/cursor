import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { HeatmapChart } from 'echarts/charts';
import {
  TooltipComponent,
  VisualMapComponent,
  CalendarComponent,
  TitleComponent,
  ToolboxComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { formatCurrency, formatDate } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  CalendarComponent,
  ToolboxComponent,
  HeatmapChart,
  CanvasRenderer
]);

interface CalendarData {
  date: string;
  value: number;
}

interface CalendarHeatmapProps {
  data: CalendarData[];
  title?: string;
  year?: number;
  cellSize?: number | [number, number];
  range?: [string, string];
  orient?: 'horizontal' | 'vertical';
  visualMap?: {
    min?: number;
    max?: number;
    calculable?: boolean;
    orient?: 'horizontal' | 'vertical';
    left?: string | number;
    bottom?: string | number;
    inRange?: {
      color: string[];
    };
  };
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  data,
  title,
  year = new Date().getFullYear(),
  cellSize = 20,
  range,
  orient = 'horizontal',
  visualMap
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const values = data.map(item => item.value);
      const defaultVisualMap = {
        min: Math.min(...values),
        max: Math.max(...values),
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '5%',
        inRange: {
          color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
        }
      };

      const option = {
        title: {
          text: title,
          left: 'center',
          top: 20
        },
        tooltip: {
          position: 'top',
          formatter: (params: any) => {
            const { value } = params;
            return `${formatDate(value[0])}<br/>
              金额: ${formatCurrency(value[1])}`;
          }
        },
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
        visualMap: {
          ...defaultVisualMap,
          ...visualMap
        },
        calendar: {
          top: 80,
          left: 30,
          right: 30,
          cellSize,
          range: range || year,
          orient,
          itemStyle: {
            borderWidth: 0.5,
            borderColor: '#fff'
          },
          yearLabel: { show: true },
          monthLabel: {
            nameMap: 'cn'
          },
          dayLabel: {
            firstDay: 1,
            nameMap: 'cn'
          }
        },
        series: {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          calendarIndex: 0,
          data: data.map(item => [item.date, item.value])
        }
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, year, cellSize, range, orient, visualMap]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ height: '400px', width: '100%' }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentOrient = option.calendar[0].orient;
              const newOrient = currentOrient === 'horizontal' ? 'vertical' : 'horizontal';
              
              option.calendar[0].orient = newOrient;
              option.calendar[0].top = newOrient === 'horizontal' ? 80 : 120;
              option.calendar[0].left = newOrient === 'horizontal' ? 30 : 'center';
              
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换方向
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentSize = option.calendar[0].cellSize;
              const newSize = typeof currentSize === 'number' ? 
                (currentSize === 20 ? 30 : 20) : 
                (currentSize[0] === 20 ? 30 : 20);
              
              option.calendar[0].cellSize = newSize;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换大小
        </button>
      </div>
    </div>
  );
};

export default CalendarHeatmap; 