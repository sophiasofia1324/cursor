import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { SankeyChart } from 'echarts/charts';
import {
  TooltipComponent,
  ToolboxComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  SankeyChart,
  CanvasRenderer
]);

interface SankeyNode {
  name: string;
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  label?: {
    show?: boolean;
    position?: 'left' | 'right' | 'top' | 'bottom' | 'inside';
    fontSize?: number;
    fontWeight?: number | string;
  };
  emphasis?: {
    itemStyle?: {
      color?: string;
      borderColor?: string;
      borderWidth?: number;
    };
    label?: {
      show?: boolean;
      fontSize?: number;
      fontWeight?: number | string;
    };
  };
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  lineStyle?: {
    color?: string;
    opacity?: number;
    curveness?: number;
  };
  emphasis?: {
    lineStyle?: {
      color?: string;
      opacity?: number;
      width?: number;
    };
  };
}

interface SankeyChartProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  title?: string;
  orient?: 'horizontal' | 'vertical';
  nodeWidth?: number;
  nodeGap?: number;
  nodeAlign?: 'justify' | 'left' | 'right';
  draggable?: boolean;
  levels?: Array<{
    depth: number;
    itemStyle?: {
      color?: string;
      borderColor?: string;
      borderWidth?: number;
    };
    lineStyle?: {
      color?: string;
      opacity?: number;
      curveness?: number;
    };
  }>;
}

const SankeyChart2: React.FC<SankeyChartProps> = ({
  nodes,
  links,
  title,
  orient = 'horizontal',
  nodeWidth = 20,
  nodeGap = 8,
  nodeAlign = 'justify',
  draggable = true,
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
          triggerOn: 'mousemove',
          formatter: (params: any) => {
            if (params.dataType === 'node') {
              return `${params.name}`;
            }
            return `${params.data.source} -> ${params.data.target}<br/>
              数值: ${formatCurrency(params.value)}`;
          }
        },
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
        series: [{
          type: 'sankey',
          data: nodes,
          links: links.map(link => ({
            ...link,
            lineStyle: {
              color: 'source',
              opacity: 0.3,
              ...link.lineStyle
            }
          })),
          orient,
          nodeWidth,
          nodeGap,
          nodeAlign,
          draggable,
          levels: levels.length > 0 ? levels : undefined,
          label: {
            position: orient === 'horizontal' ? 'right' : 'top',
            fontSize: 12
          },
          lineStyle: {
            curveness: 0.5,
            color: 'source'
          },
          emphasis: {
            focus: 'adjacency',
            label: {
              fontSize: 14,
              fontWeight: 'bold'
            },
            lineStyle: {
              opacity: 0.6,
              width: 3
            }
          }
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [nodes, links, title, orient, nodeWidth, nodeGap, nodeAlign, draggable, levels]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ height: '600px', width: '100%' }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentOrient = option.series[0].orient;
              const newOrient = currentOrient === 'horizontal' ? 'vertical' : 'horizontal';
              
              option.series[0].orient = newOrient;
              option.series[0].label.position = newOrient === 'horizontal' ? 'right' : 'top';
              
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
              const currentAlign = option.series[0].nodeAlign;
              const alignMap = {
                'justify': 'left',
                'left': 'right',
                'right': 'justify'
              };
              option.series[0].nodeAlign = alignMap[currentAlign as keyof typeof alignMap];
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换对齐方式
        </button>
      </div>
    </div>
  );
};

export default SankeyChart2; 