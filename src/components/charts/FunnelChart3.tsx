import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { FunnelChart } from 'echarts/charts';
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
  FunnelChart,
  CanvasRenderer
]);

interface FunnelItem {
  name: string;
  value: number;
  itemStyle?: {
    color?: string;
    opacity?: number;
  };
  label?: {
    show?: boolean;
    position?: 'inside' | 'outside' | 'left' | 'right' | 'top' | 'bottom';
    formatter?: string | ((params: any) => string);
  };
  emphasis?: {
    label?: {
      show?: boolean;
      fontSize?: number;
    };
    itemStyle?: {
      opacity?: number;
    };
  };
}

interface FunnelChartProps {
  data: FunnelItem[];
  title?: string;
  width?: string | number;
  height?: string | number;
  sort?: 'ascending' | 'descending' | 'none';
  gap?: number;
  funnelAlign?: 'center' | 'left' | 'right';
  minSize?: string;
  maxSize?: string;
  showLegend?: boolean;
  showToolbox?: boolean;
  showMarkLine?: boolean;
  showMarkPoint?: boolean;
  labelPosition?: 'inside' | 'outside' | 'left' | 'right';
}

const FunnelChart3: React.FC<FunnelChartProps> = ({
  data,
  title,
  width = '100%',
  height = 400,
  sort = 'descending',
  gap = 2,
  funnelAlign = 'center',
  minSize = '0%',
  maxSize = '100%',
  showLegend = true,
  showToolbox = true,
  showMarkLine = false,
  showMarkPoint = false,
  labelPosition = 'inside'
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
          data: data.map(item => item.name),
          bottom: 0
        } : undefined,
        series: [{
          name: title,
          type: 'funnel',
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: showLegend ? '15%' : '10%',
          width: '80%',
          min: 0,
          max: Math.max(...data.map(item => item.value)),
          minSize,
          maxSize,
          sort,
          gap,
          funnelAlign,
          label: {
            show: true,
            position: labelPosition,
            formatter: (params: any) => {
              return `${params.name}\n${formatCurrency(params.value)}\n(${formatPercentage(params.percent / 100)})`;
            }
          },
          emphasis: {
            label: {
              fontSize: 20
            }
          },
          data: data.map((item, index) => ({
            ...item,
            itemStyle: {
              color: item.itemStyle?.color || CHART_COLORS[index % CHART_COLORS.length],
              opacity: item.itemStyle?.opacity || 0.8
            }
          })),
          markLine: showMarkLine ? {
            data: [
              { type: 'average', name: '平均值' }
            ]
          } : undefined,
          markPoint: showMarkPoint ? {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          } : undefined
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, sort, gap, funnelAlign, minSize, maxSize, showLegend, showToolbox, showMarkLine, showMarkPoint, labelPosition]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentSort = option.series[0].sort;
              const sortMap = {
                'descending': 'ascending',
                'ascending': 'none',
                'none': 'descending'
              };
              option.series[0].sort = sortMap[currentSort as keyof typeof sortMap];
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换排序
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentAlign = option.series[0].funnelAlign;
              const alignMap = {
                'center': 'left',
                'left': 'right',
                'right': 'center'
              };
              option.series[0].funnelAlign = alignMap[currentAlign as keyof typeof alignMap];
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换对齐
        </button>
      </div>
    </div>
  );
};

export default FunnelChart3; 