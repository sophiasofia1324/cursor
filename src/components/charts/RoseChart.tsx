import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency, formatPercentage } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  MarkLineComponent,
  MarkPointComponent,
  PieChart,
  CanvasRenderer
]);

interface RoseData {
  name: string;
  value: number;
  itemStyle?: {
    color?: string;
    opacity?: number;
  };
  label?: {
    show?: boolean;
    position?: 'inside' | 'outside';
    formatter?: string | ((params: any) => string);
  };
  emphasis?: {
    scale?: boolean;
    scaleSize?: number;
    focus?: 'self' | 'series';
  };
}

interface RoseChartProps {
  data: RoseData[];
  title?: string;
  width?: string | number;
  height?: string | number;
  roseType?: 'radius' | 'area';
  showLegend?: boolean;
  showToolbox?: boolean;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  radius?: [string | number, string | number];
  center?: [string | number, string | number];
  itemStyle?: {
    borderRadius?: number;
    borderColor?: string;
    borderWidth?: number;
  };
}

const RoseChart: React.FC<RoseChartProps> = ({
  data,
  title,
  width = '100%',
  height = 400,
  roseType = 'radius',
  showLegend = true,
  showToolbox = true,
  showLabel = true,
  labelPosition = 'outside',
  radius = ['20%', '80%'],
  center = ['50%', '50%'],
  itemStyle = {
    borderRadius: 4,
    borderColor: '#fff',
    borderWidth: 2
  }
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const totalValue = data.reduce((sum, item) => sum + item.value, 0);

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const { name, value, percent } = params;
            return `${name}<br/>
              金额: ${formatCurrency(value)}<br/>
              占比: ${formatPercentage(percent / 100)}`;
          }
        },
        toolbox: showToolbox ? {
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {}
          }
        } : undefined,
        legend: showLegend ? {
          type: 'scroll',
          orient: 'horizontal',
          bottom: 10,
          data: data.map(item => item.name)
        } : undefined,
        series: [{
          name: title,
          type: 'pie',
          roseType,
          radius,
          center,
          itemStyle: {
            ...itemStyle,
            borderRadius: itemStyle.borderRadius
          },
          label: {
            show: showLabel,
            position: labelPosition,
            formatter: (params: any) => {
              return `${params.name}\n${formatCurrency(params.value)}\n(${formatPercentage(params.percent / 100)})`;
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          data: data.map((item, index) => ({
            ...item,
            itemStyle: {
              color: item.itemStyle?.color || CHART_COLORS[index % CHART_COLORS.length],
              opacity: item.itemStyle?.opacity || 0.8
            }
          }))
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, roseType, showLegend, showToolbox, showLabel, labelPosition, radius, center, itemStyle]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentType = option.series[0].roseType;
              option.series[0].roseType = currentType === 'radius' ? 'area' : 'radius';
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换类型
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentPosition = option.series[0].label.position;
              option.series[0].label.position = currentPosition === 'inside' ? 'outside' : 'inside';
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

export default RoseChart; 