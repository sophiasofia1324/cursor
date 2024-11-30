import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { ThemeRiverChart as EChartsThemeRiver } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  SingleAxisComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency, formatDate } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  SingleAxisComponent,
  DataZoomComponent,
  EChartsThemeRiver,
  CanvasRenderer
]);

interface ThemeRiverData {
  time: string | number;
  value: number;
  theme: string;
}

interface ThemeRiverChartProps {
  data: ThemeRiverData[];
  title?: string;
  width?: string | number;
  height?: string | number;
  boundaryGap?: [string | number, string | number];
  showDataZoom?: boolean;
  showToolbox?: boolean;
  showLegend?: boolean;
  labelPosition?: 'left' | 'right' | 'top' | 'bottom';
  colors?: string[];
}

const ThemeRiverChart: React.FC<ThemeRiverChartProps> = ({
  data,
  title,
  width = '100%',
  height = 400,
  boundaryGap = ['10%', '10%'],
  showDataZoom = true,
  showToolbox = true,
  showLegend = true,
  labelPosition = 'right',
  colors = CHART_COLORS
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const formattedData = data.map(item => [
        item.time,
        item.value,
        item.theme
      ]);

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'line',
            lineStyle: {
              color: 'rgba(0,0,0,0.2)',
              width: 1,
              type: 'solid'
            }
          },
          formatter: (params: any[]) => {
            const time = params[0].value[0];
            let result = `${formatDate(new Date(time))}<br/>`;
            params.forEach(param => {
              result += `${param.marker}${param.seriesName}: ${formatCurrency(param.value[1])}<br/>`;
            });
            return result;
          }
        },
        legend: showLegend ? {
          data: Array.from(new Set(data.map(item => item.theme))),
          bottom: 0
        } : undefined,
        toolbox: showToolbox ? {
          feature: {
            dataZoom: { show: true },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        } : undefined,
        singleAxis: {
          type: 'time',
          boundaryGap,
          axisTick: { show: false },
          axisLabel: {
            formatter: (value: string) => formatDate(new Date(value))
          }
        },
        dataZoom: showDataZoom ? [
          {
            type: 'slider',
            show: true,
            singleAxisIndex: 0,
            start: 0,
            end: 100
          },
          {
            type: 'inside',
            singleAxisIndex: 0,
            start: 0,
            end: 100
          }
        ] : undefined,
        series: [{
          type: 'themeRiver',
          data: formattedData,
          label: {
            show: true,
            position: labelPosition,
            formatter: (params: any) => {
              return `${params.seriesName}\n${formatCurrency(params.value[1])}`;
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowColor: 'rgba(0, 0, 0, 0.8)'
            }
          }
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, boundaryGap, showDataZoom, showToolbox, showLegend, labelPosition, colors]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const positions = ['left', 'right', 'top', 'bottom'];
              const currentPosition = option.series[0].label.position;
              const nextPosition = positions[(positions.indexOf(currentPosition) + 1) % positions.length];
              
              option.series[0].label.position = nextPosition;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换标签位置
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentGap = option.singleAxis.boundaryGap;
              const newGap = currentGap[0] === '10%' ? ['5%', '5%'] : ['10%', '10%'];
              
              option.singleAxis.boundaryGap = newGap;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换边界间隔
        </button>
      </div>
    </div>
  );
};

export default ThemeRiverChart; 