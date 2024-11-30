import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { SunburstChart as EChartsSunburst } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  VisualMapComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  EChartsSunburst,
  CanvasRenderer
]);

interface SunburstNode {
  name: string;
  value?: number;
  children?: SunburstNode[];
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  label?: {
    show?: boolean;
    position?: 'inside' | 'outside';
    rotate?: number | 'radial' | 'tangential';
    minAngle?: number;
  };
}

interface SunburstChartProps {
  data: SunburstNode;
  title?: string;
  width?: string | number;
  height?: string | number;
  radius?: [string | number, string | number];
  center?: [string | number, string | number];
  sort?: 'desc' | 'asc' | 'null';
  highlightPolicy?: 'ancestor' | 'descendant';
  levels?: Array<{
    radius?: [string | number, string | number];
    itemStyle?: {
      color?: string;
      borderWidth?: number;
      borderColor?: string;
    };
    label?: {
      rotate?: number | 'radial' | 'tangential';
      align?: 'center' | 'left' | 'right';
    };
  }>;
}

const SunburstChart: React.FC<SunburstChartProps> = ({
  data,
  title,
  width = '100%',
  height = 500,
  radius = ['0%', '95%'],
  center = ['50%', '50%'],
  sort = 'desc',
  highlightPolicy = 'descendant',
  levels = []
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
            const { name, value, treePathInfo } = params;
            const path = treePathInfo.map((item: any) => item.name).join(' > ');
            return `路径: ${path}<br/>
              名称: ${name}<br/>
              ${value !== undefined ? `金额: ${formatCurrency(value)}` : ''}`;
          }
        },
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
        series: [{
          type: 'sunburst',
          data: [data],
          radius,
          center,
          sort,
          highlightPolicy,
          levels: [
            {
              itemStyle: {
                borderWidth: 2
              }
            },
            ...levels
          ],
          label: {
            rotate: 'radial'
          },
          emphasis: {
            focus: 'ancestor'
          },
          animation: true,
          animationType: 'expansion',
          animationDurationUpdate: 750
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, radius, center, sort, highlightPolicy, levels]);

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
                'desc': 'asc',
                'asc': 'null',
                'null': 'desc'
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
              const currentPolicy = option.series[0].highlightPolicy;
              option.series[0].highlightPolicy = currentPolicy === 'ancestor' ? 'descendant' : 'ancestor';
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换高亮策略
        </button>
      </div>
    </div>
  );
};

export default SunburstChart; 