import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { ScatterChart as EChartsScatter } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
  DataZoomComponent,
  ToolboxComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  EChartsScatter,
  CanvasRenderer
]);

interface ScatterData {
  name: string;
  data: Array<[number, number]>;
  symbolSize?: number;
  itemStyle?: {
    color?: string;
  };
}

interface ScatterChartProps {
  data: ScatterData[];
  title?: string;
  xAxisName?: string;
  yAxisName?: string;
  symbolSize?: number;
  showDataZoom?: boolean;
  showToolbox?: boolean;
  regression?: boolean;
}

const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  title,
  xAxisName,
  yAxisName,
  symbolSize = 10,
  showDataZoom = true,
  showToolbox = true,
  regression = false
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const series = data.map((item, index) => {
        const basicSeries = {
          name: item.name,
          type: 'scatter',
          data: item.data,
          symbolSize: item.symbolSize || symbolSize,
          itemStyle: {
            color: item.itemStyle?.color || CHART_COLORS[index % CHART_COLORS.length]
          }
        };

        if (regression && item.data.length > 1) {
          const regressionData = calculateRegression(item.data);
          return [
            basicSeries,
            {
              name: `${item.name} 趋势线`,
              type: 'line',
              data: regressionData,
              showSymbol: false,
              lineStyle: {
                color: item.itemStyle?.color || CHART_COLORS[index % CHART_COLORS.length],
                type: 'dashed'
              }
            }
          ];
        }

        return basicSeries;
      }).flat();

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: (params: any) => {
            const { name, value, seriesName } = params;
            if (params.componentSubType === 'line') {
              return `${seriesName}<br/>${xAxisName || 'X'}: ${formatCurrency(value[0])}<br/>${yAxisName || 'Y'}: ${formatCurrency(value[1])}`;
            }
            return `${seriesName}<br/>${xAxisName || 'X'}: ${formatCurrency(value[0])}<br/>${yAxisName || 'Y'}: ${formatCurrency(value[1])}`;
          }
        },
        toolbox: showToolbox ? {
          feature: {
            dataZoom: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        } : undefined,
        legend: {
          data: data.map(item => [item.name, ...(regression ? [`${item.name} 趋势线`] : [])]).flat(),
          bottom: showDataZoom ? 40 : 0
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: showDataZoom ? '15%' : '10%'
        },
        xAxis: {
          name: xAxisName,
          type: 'value',
          scale: true,
          axisLabel: {
            formatter: (value: number) => formatCurrency(value)
          }
        },
        yAxis: {
          name: yAxisName,
          type: 'value',
          scale: true,
          axisLabel: {
            formatter: (value: number) => formatCurrency(value)
          }
        },
        dataZoom: showDataZoom ? [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100
          },
          {
            type: 'slider',
            show: true,
            yAxisIndex: [0],
            left: '93%',
            start: 0,
            end: 100
          }
        ] : undefined,
        series
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, xAxisName, yAxisName, symbolSize, showDataZoom, showToolbox, regression]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ height: '500px', width: '100%' }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const currentSymbolSize = option.series[0].symbolSize;
              const newSymbolSize = currentSymbolSize === symbolSize ? symbolSize * 2 : symbolSize;
              
              option.series.forEach((series: any) => {
                if (series.type === 'scatter') {
                  series.symbolSize = newSymbolSize;
                }
              });
              
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换点大小
        </button>
      </div>
    </div>
  );
};

// 计算线性回归
const calculateRegression = (data: Array<[number, number]>): Array<[number, number]> => {
  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  data.forEach(([x, y]) => {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const minX = Math.min(...data.map(([x]) => x));
  const maxX = Math.max(...data.map(([x]) => x));

  return [
    [minX, slope * minX + intercept],
    [maxX, slope * maxX + intercept]
  ];
};

export default ScatterChart; 