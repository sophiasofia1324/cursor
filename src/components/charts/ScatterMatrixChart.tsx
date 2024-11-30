import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { ScatterChart } from 'echarts/charts';
import {
  TooltipComponent,
  GridComponent,
  TitleComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  ToolboxComponent,
  VisualMapComponent,
  DataZoomComponent,
  ScatterChart,
  CanvasRenderer
]);

interface ScatterMatrixData {
  name: string;
  data: Record<string, number>[];
  itemStyle?: {
    color?: string;
    opacity?: number;
  };
}

interface ScatterMatrixChartProps {
  data: ScatterMatrixData[];
  dimensions: string[];
  title?: string;
  width?: string | number;
  height?: string | number;
  symbolSize?: number;
  showVisualMap?: boolean;
  showDataZoom?: boolean;
  showToolbox?: boolean;
}

const ScatterMatrixChart: React.FC<ScatterMatrixChartProps> = ({
  data,
  dimensions,
  title,
  width = '100%',
  height = 600,
  symbolSize = 4,
  showVisualMap = true,
  showDataZoom = true,
  showToolbox = true
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      // 计算网格布局
      const gridCount = dimensions.length;
      const gridWidth = 100 / gridCount;
      const gridHeight = 100 / gridCount;
      const padding = 5;

      // 创建网格和系列
      const grids: any[] = [];
      const series: any[] = [];
      const xAxes: any[] = [];
      const yAxes: any[] = [];

      dimensions.forEach((yDim, i) => {
        dimensions.forEach((xDim, j) => {
          const gridId = `grid_${i}_${j}`;
          
          // 添加网格
          grids.push({
            id: gridId,
            left: `${j * gridWidth + padding}%`,
            top: `${i * gridHeight + padding}%`,
            width: `${gridWidth - padding * 2}%`,
            height: `${gridHeight - padding * 2}%`,
            show: true
          });

          // 添加坐标轴
          xAxes.push({
            gridId,
            type: 'value',
            name: j === 0 ? yDim : '',
            nameLocation: 'middle',
            nameGap: 25,
            scale: true,
            axisLabel: {
              formatter: (value: number) => formatCurrency(value)
            }
          });

          yAxes.push({
            gridId,
            type: 'value',
            name: i === gridCount - 1 ? xDim : '',
            nameLocation: 'middle',
            nameGap: 25,
            scale: true,
            axisLabel: {
              formatter: (value: number) => formatCurrency(value)
            }
          });

          // 为每个系列添加散点图
          data.forEach((series_data, dataIndex) => {
            series.push({
              name: series_data.name,
              type: 'scatter',
              xAxisIndex: i * gridCount + j,
              yAxisIndex: i * gridCount + j,
              data: series_data.data.map(item => [item[xDim], item[yDim]]),
              symbolSize,
              itemStyle: {
                opacity: 0.7,
                ...series_data.itemStyle,
                color: series_data.itemStyle?.color || CHART_COLORS[dataIndex % CHART_COLORS.length]
              }
            });
          });
        });
      });

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'cross'
          },
          formatter: (params: any) => {
            const { seriesName, value } = params;
            return `${seriesName}<br/>
              ${xAxes[params.seriesIndex].name}: ${formatCurrency(value[0])}<br/>
              ${yAxes[params.seriesIndex].name}: ${formatCurrency(value[1])}`;
          }
        },
        toolbox: showToolbox ? {
          feature: {
            dataZoom: { show: true },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        } : undefined,
        dataZoom: showDataZoom ? [
          {
            type: 'slider',
            show: true,
            xAxisIndex: xAxes.map((_, i) => i),
            start: 0,
            end: 100
          },
          {
            type: 'slider',
            show: true,
            yAxisIndex: yAxes.map((_, i) => i),
            start: 0,
            end: 100
          }
        ] : undefined,
        grid: grids,
        xAxis: xAxes,
        yAxis: yAxes,
        series
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, dimensions, title, symbolSize, showVisualMap, showDataZoom, showToolbox]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width, height }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentSize = option.series[0].symbolSize;
              const newSize = currentSize === symbolSize ? symbolSize * 2 : symbolSize;
              
              option.series.forEach((series: any) => {
                series.symbolSize = newSize;
              });
              
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换点大小
        </button>
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentOpacity = option.series[0].itemStyle.opacity;
              const newOpacity = currentOpacity === 0.7 ? 0.3 : 0.7;
              
              option.series.forEach((series: any) => {
                series.itemStyle.opacity = newOpacity;
              });
              
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换透明度
        </button>
      </div>
    </div>
  );
};

export default ScatterMatrixChart; 