import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { GraphChart as EChartsGraph } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  EChartsGraph,
  CanvasRenderer
]);

interface GraphNode {
  id: string;
  name: string;
  value?: number;
  category?: number;
  symbolSize?: number;
  x?: number;
  y?: number;
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  label?: {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
  };
}

interface GraphLink {
  source: string;
  target: string;
  value?: number;
  lineStyle?: {
    color?: string;
    width?: number;
    type?: 'solid' | 'dashed' | 'dotted';
    curveness?: number;
  };
  label?: {
    show?: boolean;
    formatter?: string | ((params: any) => string);
  };
}

interface GraphCategory {
  name: string;
  itemStyle?: {
    color?: string;
  };
}

interface GraphChartProps {
  nodes: GraphNode[];
  links: GraphLink[];
  categories?: GraphCategory[];
  title?: string;
  width?: string | number;
  height?: string | number;
  layout?: 'none' | 'circular' | 'force';
  draggable?: boolean;
  roam?: boolean | 'scale' | 'move';
  focusNodeAdjacency?: boolean;
  force?: {
    repulsion?: number;
    gravity?: number;
    edgeLength?: number;
    friction?: number;
  };
}

const GraphChart: React.FC<GraphChartProps> = ({
  nodes,
  links,
  categories = [],
  title,
  width = '100%',
  height = 600,
  layout = 'force',
  draggable = true,
  roam = true,
  focusNodeAdjacency = true,
  force = {
    repulsion: 100,
    gravity: 0.1,
    edgeLength: 30,
    friction: 0.6
  }
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
            if (params.dataType === 'node') {
              return `${params.name}${params.value ? `<br/>金额: ${formatCurrency(params.value)}` : ''}`;
            }
            if (params.dataType === 'edge') {
              return `${params.data.source} -> ${params.data.target}${params.value ? `<br/>金额: ${formatCurrency(params.value)}` : ''}`;
            }
            return '';
          }
        },
        legend: categories.length > 0 ? {
          data: categories.map(cat => cat.name),
          bottom: 0
        } : undefined,
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [{
          type: 'graph',
          layout,
          data: nodes,
          links,
          categories,
          roam,
          draggable,
          focusNodeAdjacency,
          force,
          label: {
            show: true,
            position: 'right'
          },
          lineStyle: {
            color: 'source',
            curveness: 0.3
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: {
              width: 4
            }
          }
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [nodes, links, categories, title, layout, draggable, roam, focusNodeAdjacency, force]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const layouts = ['none', 'circular', 'force'];
              const currentLayout = option.series[0].layout;
              const nextLayout = layouts[(layouts.indexOf(currentLayout) + 1) % layouts.length];
              
              option.series[0].layout = nextLayout;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换布局
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentFocus = option.series[0].focusNodeAdjacency;
              option.series[0].focusNodeAdjacency = !currentFocus;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换高亮模式
        </button>
      </div>
    </div>
  );
};

export default GraphChart; 