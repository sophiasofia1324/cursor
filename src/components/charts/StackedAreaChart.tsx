import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency, formatDate } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  LineChart,
  CanvasRenderer
]);

interface StackedAreaData {
  name: string;
  data: Array<[string | number, number]>;
  stack?: string;
  areaStyle?: {
    color?: string;
    opacity?: number;
  };
  emphasis?: {
    focus?: 'series' | 'self' | 'none';
    areaStyle?: {
      opacity?: number;
    };
  };
}

interface StackedAreaChartProps {
  data: StackedAreaData[];
  title?: string;
  width?: string | number;
  height?: string | number;
  smooth?: boolean;
  showSymbol?: boolean;
  showDataZoom?: boolean;
  showToolbox?: boolean;
  showLegend?: boolean;
  stack?: string;
  areaStyle?: {
    opacity?: number;
  };
}

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({
  data,
  title,
  width = '100%',
  height = 400,
  smooth = true,
  showSymbol = false,
  showDataZoom = true,
  showToolbox = true,
  showLegend = true,
  stack = 'total',
  areaStyle = {
    opacity: 0.7
  }
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      // 获取所有时间点
      const allTimes = Array.from(new Set(
        data.flatMap(series => series.data.map(item => item[0]))
      )).sort();

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          },
          formatter: (params: any[]) => {
            const time = params[0].axisValue;
            let result = `${formatDate(new Date(time))}<br/>`;
            let total = 0;
            
            params.forEach(param => {
              const value = param.value[1];
              total += value;
              result += `${param.marker} ${param.seriesName}: ${formatCurrency(value)}<br/>`;
            });
            
            result += `总计: ${formatCurrency(total)}`;
            return result;
          }
        },
        legend: showLegend ? {
          data: data.map(item => item.name),
          bottom: showDataZoom ? 40 : 0
        } : undefined,
        toolbox: showToolbox ? {
          feature: {
            dataZoom: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { type: ['line', 'bar', 'stack'] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        } : undefined,
        grid: {
          left: '3%',
          right: '4%',
          bottom: showDataZoom ? '15%' : '10%',
          containLabel: true
        },
        xAxis: {
          type: 'time',
          boundaryGap: false
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: number) => formatCurrency(value)
          }
        },
        dataZoom: showDataZoom ? [
          {
            type: 'slider',
            start: 0,
            end: 100
          },
          {
            type: 'inside',
            start: 0,
            end: 100
          }
        ] : undefined,
        series: data.map((item, index) => ({
          name: item.name,
          type: 'line',
          stack: item.stack || stack,
          smooth,
          showSymbol,
          areaStyle: {
            opacity: areaStyle.opacity,
            ...item.areaStyle
          },
          emphasis: {
            focus: 'series',
            ...item.emphasis
          },
          data: item.data,
          itemStyle: {
            color: item.areaStyle?.color || CHART_COLORS[index % CHART_COLORS.length]
          }
        }))
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, smooth, showSymbol, showDataZoom, showToolbox, showLegend, stack, areaStyle]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentSmooth = option.series[0].smooth;
              
              option.series.forEach((series: any) => {
                series.smooth = !currentSmooth;
              });
              
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换平滑
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentOpacity = option.series[0].areaStyle.opacity;
              const newOpacity = currentOpacity === 0.7 ? 0.3 : 0.7;
              
              option.series.forEach((series: any) => {
                series.areaStyle.opacity = newOpacity;
              });
              
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换透明度
        </button>
      </div>
    </div>
  );
};

export default StackedAreaChart; 