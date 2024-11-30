import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { FunnelChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  FunnelChart,
  CanvasRenderer
]);

interface FunnelItem {
  name: string;
  value: number;
  itemStyle?: {
    color?: string;
  };
  label?: {
    position?: 'inside' | 'outside' | 'left' | 'right' | 'top' | 'bottom';
    formatter?: string | Function;
  };
}

interface FunnelChartProps {
  data: FunnelItem[];
  title?: string;
  width?: string | number;
  height?: string | number;
  sort?: 'ascending' | 'descending' | 'none';
  orientation?: 'vertical' | 'horizontal';
  gap?: number;
  labelPosition?: 'inside' | 'outside' | 'left' | 'right';
  showToolbox?: boolean;
}

const FunnelChart2: React.FC<FunnelChartProps> = ({
  data,
  title,
  width = '100%',
  height = 400,
  sort = 'descending',
  orientation = 'vertical',
  gap = 2,
  labelPosition = 'inside',
  showToolbox = true
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
            const { name, value, percent } = params;
            return `${name}<br/>金额: ${formatCurrency(value)}<br/>占比: ${percent}%`;
          }
        },
        toolbox: showToolbox ? {
          feature: {
            saveAsImage: { title: '保存图片' },
            restore: { title: '重置' },
            dataView: { title: '数据视图', lang: ['数据视图', '关闭', '刷新'] }
          }
        } : undefined,
        legend: {
          data: data.map(item => item.name),
          bottom: 0
        },
        series: [{
          name: title,
          type: 'funnel',
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '10%',
          width: orientation === 'vertical' ? '80%' : '40%',
          height: orientation === 'vertical' ? '70%' : '80%',
          min: 0,
          max: Math.max(...data.map(item => item.value)),
          minSize: '0%',
          maxSize: '100%',
          sort,
          gap,
          orient: orientation === 'vertical' ? 'vertical' : 'horizontal',
          label: {
            show: true,
            position: labelPosition,
            formatter: (params: any) => {
              return `${params.name}\n${formatCurrency(params.value)}`;
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
              color: item.itemStyle?.color || CHART_COLORS[index % CHART_COLORS.length]
            }
          }))
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, sort, orientation, gap, labelPosition, showToolbox]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentOrientation = option.series[0].orient;
              const newOrientation = currentOrientation === 'vertical' ? 'horizontal' : 'vertical';
              
              option.series[0].orient = newOrientation;
              option.series[0].width = newOrientation === 'vertical' ? '80%' : '40%';
              option.series[0].height = newOrientation === 'vertical' ? '70%' : '80%';
              
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
              const currentPosition = option.series[0].label.position;
              const positions = ['inside', 'outside', 'left', 'right'];
              const nextPosition = positions[(positions.indexOf(currentPosition) + 1) % positions.length];
              
              option.series[0].label.position = nextPosition;
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

export default FunnelChart2; 