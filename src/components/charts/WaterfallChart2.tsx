import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
  ToolboxComponent,
  MarkLineComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  MarkLineComponent,
  BarChart,
  CanvasRenderer
]);

interface WaterfallData {
  name: string;
  value: number;
  itemStyle?: {
    color?: string;
    opacity?: number;
    borderRadius?: number;
  };
  emphasis?: {
    itemStyle?: {
      color?: string;
      opacity?: number;
    };
  };
}

interface WaterfallChartProps {
  data: WaterfallData[];
  title?: string;
  width?: string | number;
  height?: string | number;
  showTotal?: boolean;
  showMarkLine?: boolean;
  showToolbox?: boolean;
  barWidth?: number;
  positiveColor?: string;
  negativeColor?: string;
  totalColor?: string;
  labelPosition?: 'top' | 'bottom' | 'inside' | 'insideTop' | 'insideBottom';
}

const WaterfallChart2: React.FC<WaterfallChartProps> = ({
  data,
  title,
  width = '100%',
  height = 400,
  showTotal = true,
  showMarkLine = true,
  showToolbox = true,
  barWidth = 30,
  positiveColor = '#34d399',
  negativeColor = '#f87171',
  totalColor = '#60a5fa',
  labelPosition = 'top'
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      // 计算累计值和总计
      let sum = 0;
      const values = data.map(item => {
        const currentSum = sum;
        sum += item.value;
        return {
          name: item.name,
          value: item.value,
          currentSum
        };
      });

      if (showTotal) {
        values.push({
          name: '总计',
          value: sum,
          currentSum: 0,
          itemStyle: {
            color: totalColor,
            opacity: 0.8
          }
        });
      }

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params: any) => {
            const item = params[0];
            const data = values[item.dataIndex];
            if (data.name === '总计') {
              return `${data.name}: ${formatCurrency(data.value)}`;
            }
            return `${data.name}<br/>
              变化: ${formatCurrency(data.value)}<br/>
              累计: ${formatCurrency(data.currentSum + data.value)}`;
          }
        },
        toolbox: showToolbox ? {
          feature: {
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        } : undefined,
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: values.map(item => item.name),
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value: number) => formatCurrency(value)
          }
        },
        series: [
          {
            name: '辅助',
            type: 'bar',
            stack: '总量',
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent'
            },
            data: values.map(item => item.currentSum)
          },
          {
            name: '数值',
            type: 'bar',
            stack: '总量',
            barWidth,
            label: {
              show: true,
              position: labelPosition,
              formatter: (params: any) => {
                const value = values[params.dataIndex].value;
                return formatCurrency(value);
              }
            },
            data: values.map(item => ({
              value: item.value,
              itemStyle: {
                color: item.name === '总计' ? totalColor :
                  item.value >= 0 ? positiveColor : negativeColor,
                opacity: 0.8,
                borderRadius: 4
              }
            }))
          }
        ]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, showTotal, showMarkLine, showToolbox, barWidth, positiveColor, negativeColor, totalColor, labelPosition]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentWidth = option.series[1].barWidth;
              option.series[1].barWidth = currentWidth === barWidth ? barWidth * 1.5 : barWidth;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换柱宽
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const positions = ['top', 'inside', 'bottom'];
              const currentPosition = option.series[1].label.position;
              const nextPosition = positions[(positions.indexOf(currentPosition) + 1) % positions.length];
              option.series[1].label.position = nextPosition;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换标签位置
        </button>
      </div>
    </div>
  );
};

export default WaterfallChart2; 