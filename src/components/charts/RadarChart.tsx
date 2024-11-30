import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { RadarChart as EChartsRadar } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  EChartsRadar,
  CanvasRenderer
]);

interface RadarIndicator {
  name: string;
  max: number;
}

interface RadarData {
  name: string;
  value: number[];
}

interface RadarChartProps {
  indicators: RadarIndicator[];
  data: RadarData[];
  title?: string;
  shape?: 'polygon' | 'circle';
  areaStyle?: boolean;
  splitNumber?: number;
}

const RadarChart: React.FC<RadarChartProps> = ({
  indicators,
  data,
  title,
  shape = 'polygon',
  areaStyle = true,
  splitNumber = 5
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const { name, value, marker } = params;
            let result = `${marker} ${name}<br/>`;
            indicators.forEach((indicator, index) => {
              result += `${indicator.name}: ${formatCurrency(value[index])}<br/>`;
            });
            return result;
          }
        },
        legend: {
          data: data.map(item => item.name),
          bottom: 0
        },
        radar: {
          shape,
          indicator: indicators,
          splitNumber,
          axisName: {
            color: '#999',
            backgroundColor: '#fff',
            borderRadius: 3,
            padding: [3, 5]
          },
          splitArea: {
            areaStyle: {
              color: ['#f7f8fc', '#f2f3f7']
            }
          },
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        series: [{
          type: 'radar',
          data: data.map((item, index) => ({
            name: item.name,
            value: item.value,
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              color: CHART_COLORS[index % CHART_COLORS.length]
            },
            lineStyle: {
              width: 2
            },
            areaStyle: areaStyle ? {
              opacity: 0.2
            } : undefined,
            emphasis: {
              lineStyle: {
                width: 4
              },
              areaStyle: areaStyle ? {
                opacity: 0.4
              } : undefined
            }
          }))
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [indicators, data, title, shape, areaStyle, splitNumber]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ height: '400px', width: '100%' }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              chartInstance.current.setOption({
                radar: {
                  shape: shape === 'polygon' ? 'circle' : 'polygon'
                }
              });
            }
          }}
        >
          切换形状
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const hasAreaStyle = option.series[0].data[0].areaStyle;
              option.series[0].data.forEach((item: any) => {
                item.areaStyle = hasAreaStyle ? undefined : { opacity: 0.2 };
              });
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换填充
        </button>
      </div>
    </div>
  );
};

export default RadarChart; 