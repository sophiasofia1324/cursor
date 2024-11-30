import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { SankeyChart as EChartsSankey } from 'echarts/charts';
import {
  TooltipComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';

echarts.use([
  TitleComponent,
  TooltipComponent,
  EChartsSankey,
  CanvasRenderer
]);

interface SankeyNode {
  name: string;
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

interface SankeyChartProps {
  nodes: SankeyNode[];
  links: SankeyLink[];
  title?: string;
}

const SankeyChart: React.FC<SankeyChartProps> = ({ nodes, links, title }) => {
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
          triggerOn: 'mousemove'
        },
        series: [{
          type: 'sankey',
          data: nodes,
          links: links,
          emphasis: {
            focus: 'adjacency'
          },
          levels: [{
            depth: 0,
            itemStyle: {
              color: CHART_COLORS[0]
            },
            lineStyle: {
              color: 'source',
              opacity: 0.6
            }
          }, {
            depth: 1,
            itemStyle: {
              color: CHART_COLORS[1]
            },
            lineStyle: {
              color: 'source',
              opacity: 0.4
            }
          }]
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [nodes, links, title]);

  return <div ref={chartRef} style={{ height: '400px', width: '100%' }} />;
};

export default SankeyChart; 