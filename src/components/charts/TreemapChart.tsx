import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { TreemapChart as EChartsTreemap } from 'echarts/charts';
import {
  TooltipComponent,
  VisualMapComponent,
  TitleComponent,
  ToolboxComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency, formatPercentage } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  ToolboxComponent,
  EChartsTreemap,
  CanvasRenderer
]);

interface TreemapData {
  name: string;
  value: number;
  children?: TreemapData[];
  itemStyle?: {
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  label?: {
    show?: boolean;
    position?: 'inside' | 'top' | 'left' | 'right' | 'bottom' | 'insideLeft' | 'insideRight' | 'insideTop' | 'insideBottom';
  };
}

interface TreemapChartProps {
  data: TreemapData[];
  title?: string;
  width?: string | number;
  height?: string | number;
  leafDepth?: number;
  visualMin?: number;
  visualMax?: number;
  colorRange?: string[];
  showUpperLabel?: boolean;
  upperLabelPosition?: 'inside' | 'top' | 'left' | 'right' | 'bottom';
  drillDownIcon?: string;
  breadcrumb?: {
    show?: boolean;
    top?: number | string;
    bottom?: number | string;
    height?: number;
  };
}

const TreemapChart: React.FC<TreemapChartProps> = ({
  data,
  title,
  width = '100%',
  height = 500,
  leafDepth = 1,
  visualMin,
  visualMax,
  colorRange = ['#c6e48b', '#239a3b'],
  showUpperLabel = true,
  upperLabelPosition = 'inside',
  drillDownIcon = '▶',
  breadcrumb = {
    show: true,
    top: 'auto',
    bottom: 0,
    height: 30
  }
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      // 计算所有值的范围
      const values = data.flatMap(item => {
        const result: number[] = [item.value];
        if (item.children) {
          result.push(...item.children.map(child => child.value));
        }
        return result;
      });

      const defaultVisualMin = visualMin ?? Math.min(...values);
      const defaultVisualMax = visualMax ?? Math.max(...values);

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          formatter: (params: any) => {
            const { name, value, treePathInfo } = params;
            const path = treePathInfo.map((item: any) => item.name).join(' > ');
            return `路径: ${path}<br/>
              名称: ${name}<br/>
              金额: ${formatCurrency(value)}<br/>
              占比: ${formatPercentage(params.percent / 100)}`;
          }
        },
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {}
          }
        },
        visualMap: {
          type: 'continuous',
          min: defaultVisualMin,
          max: defaultVisualMax,
          inRange: {
            color: colorRange
          }
        },
        series: [{
          name: title,
          type: 'treemap',
          data,
          leafDepth,
          drillDownIcon,
          breadcrumb: {
            ...breadcrumb,
            itemStyle: {
              color: '#fff',
              borderColor: '#ddd',
              textStyle: {
                color: '#666'
              }
            },
            emphasis: {
              itemStyle: {
                color: '#eee'
              }
            }
          },
          levels: [
            {
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 1,
                gapWidth: 1
              },
              upperLabel: {
                show: showUpperLabel,
                height: 30,
                position: upperLabelPosition
              }
            },
            {
              colorSaturation: [0.3, 0.6],
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 1,
                gapWidth: 1
              }
            }
          ]
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, leafDepth, visualMin, visualMax, colorRange, showUpperLabel, upperLabelPosition, drillDownIcon, breadcrumb]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentPosition = option.series[0].levels[0].upperLabel.position;
              const positions = ['inside', 'top', 'left', 'right', 'bottom'];
              const nextPosition = positions[(positions.indexOf(currentPosition) + 1) % positions.length];
              
              option.series[0].levels[0].upperLabel.position = nextPosition;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换标签位置
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentDepth = option.series[0].leafDepth;
              option.series[0].leafDepth = currentDepth === 1 ? 2 : 1;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换深度
        </button>
      </div>
    </div>
  );
};

export default TreemapChart; 