import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { WordCloudChart as EChartsWordCloud } from 'echarts-wordcloud';
import {
  TooltipComponent,
  TitleComponent,
  ToolboxComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  CanvasRenderer
]);

interface WordCloudData {
  name: string;
  value: number;
  textStyle?: {
    color?: string;
    fontWeight?: number | string;
  };
}

interface WordCloudChartProps {
  data: WordCloudData[];
  title?: string;
  width?: number | string;
  height?: number | string;
  shape?: 'circle' | 'cardioid' | 'diamond' | 'triangle-forward' | 'triangle' | 'pentagon' | 'star';
  sizeRange?: [number, number];
  rotationRange?: [number, number];
  rotationStep?: number;
  gridSize?: number;
  drawOutOfBound?: boolean;
  layoutAnimation?: boolean;
}

const WordCloudChart: React.FC<WordCloudChartProps> = ({
  data,
  title,
  width = '100%',
  height = 400,
  shape = 'circle',
  sizeRange = [12, 60],
  rotationRange = [-90, 90],
  rotationStep = 45,
  gridSize = 8,
  drawOutOfBound = false,
  layoutAnimation = true
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
          show: true,
          formatter: (params: any) => {
            return `${params.name}: ${formatCurrency(params.value)}`;
          }
        },
        toolbox: {
          feature: {
            saveAsImage: { title: '保存图片' }
          }
        },
        series: [{
          type: 'wordCloud',
          shape,
          sizeRange,
          rotationRange,
          rotationStep,
          gridSize,
          drawOutOfBound,
          layoutAnimation,
          textStyle: {
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            color: function() {
              return CHART_COLORS[Math.floor(Math.random() * CHART_COLORS.length)];
            }
          },
          emphasis: {
            textStyle: {
              shadowBlur: 10,
              shadowColor: '#333'
            }
          },
          data: data.map(item => ({
            name: item.name,
            value: item.value,
            textStyle: item.textStyle
          }))
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, shape, sizeRange, rotationRange, rotationStep, gridSize, drawOutOfBound, layoutAnimation]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const shapes = ['circle', 'cardioid', 'diamond', 'triangle-forward', 'triangle', 'pentagon', 'star'];
              const option = chartInstance.current.getOption();
              const currentShape = option.series[0].shape;
              const currentIndex = shapes.indexOf(currentShape);
              const nextShape = shapes[(currentIndex + 1) % shapes.length];
              
              option.series[0].shape = nextShape;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换形状
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentRotation = option.series[0].rotationRange;
              const newRotation = currentRotation[1] === 90 ? [-45, 45] : [-90, 90];
              
              option.series[0].rotationRange = newRotation;
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换旋转范围
        </button>
      </div>
    </div>
  );
};

export default WordCloudChart; 