import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { TreeChart as EChartsTree } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  EChartsTree,
  CanvasRenderer
]);

interface TreeNode {
  name: string;
  value?: number;
  children?: TreeNode[];
}

interface TreeChartProps {
  data: TreeNode;
  title?: string;
  height?: number;
}

const TreeChart: React.FC<TreeChartProps> = ({
  data,
  title = '树图',
  height = 600
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (!chartRef.current) return;

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
      series: [
        {
          type: 'tree',
          data: [data],
          top: '10%',
          bottom: '10%',
          layout: 'orthogonal',
          symbol: 'emptyCircle',
          symbolSize: 7,
          initialTreeDepth: 2,
          lineStyle: {
            color: CHART_COLORS[0]
          },
          label: {
            position: 'left',
            verticalAlign: 'middle',
            align: 'right'
          },
          leaves: {
            label: {
              position: 'right',
              verticalAlign: 'middle',
              align: 'left'
            }
          },
          emphasis: {
            focus: 'descendant'
          },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750
        }
      ]
    };

    chartInstance.current.setOption(option);

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title]);

  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={chartRef} style={{ width: '100%', height }} />;
};

export default TreeChart; 