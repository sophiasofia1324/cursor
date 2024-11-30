import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BoxplotChart as EChartsBoxplot } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent,
  DataZoomComponent,
  ToolboxComponent,
  MarkLineComponent
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
  MarkLineComponent,
  EChartsBoxplot,
  CanvasRenderer
]);

interface BoxplotData {
  name: string;
  data: number[];
  itemStyle?: {
    color?: string;
    borderColor?: string;
  };
  outliers?: Array<[number, number]>;
}

interface BoxplotChartProps {
  data: BoxplotData[];
  title?: string;
  yAxisName?: string;
  showDataZoom?: boolean;
  showToolbox?: boolean;
  showOutliers?: boolean;
  showMarkLine?: boolean;
}

const BoxplotChart: React.FC<BoxplotChartProps> = ({
  data,
  title,
  yAxisName,
  showDataZoom = true,
  showToolbox = true,
  showOutliers = true,
  showMarkLine = true
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      // 计算箱线图数据
      const boxplotData = data.map(item => {
        const sortedData = [...item.data].sort((a, b) => a - b);
        const q1 = calculateQuantile(sortedData, 0.25);
        const median = calculateQuantile(sortedData, 0.5);
        const q3 = calculateQuantile(sortedData, 0.75);
        const iqr = q3 - q1;
        const lowerWhisker = Math.max(...sortedData.filter(v => v >= q1 - 1.5 * iqr));
        const upperWhisker = Math.min(...sortedData.filter(v => v <= q3 + 1.5 * iqr));
        
        return [lowerWhisker, q1, median, q3, upperWhisker];
      });

      // 计算异常值
      const outlierData = data.map((item, index) => {
        if (!showOutliers) return [];
        const sortedData = [...item.data].sort((a, b) => a - b);
        const q1 = calculateQuantile(sortedData, 0.25);
        const q3 = calculateQuantile(sortedData, 0.75);
        const iqr = q3 - q1;
        
        return item.data
          .map((value, i) => {
            if (value < q1 - 1.5 * iqr || value > q3 + 1.5 * iqr) {
              return [index, value];
            }
            return null;
          })
          .filter(Boolean) as Array<[number, number]>;
      });

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params: any) => {
            if (params.seriesType === 'boxplot') {
              const [min, q1, median, q3, max] = params.data;
              return `${params.name}<br/>
                上限: ${formatCurrency(max)}<br/>
                Q3: ${formatCurrency(q3)}<br/>
                中位数: ${formatCurrency(median)}<br/>
                Q1: ${formatCurrency(q1)}<br/>
                下限: ${formatCurrency(min)}`;
            }
            if (params.seriesType === 'scatter') {
              return `${params.name}<br/>异常值: ${formatCurrency(params.data[1])}`;
            }
            return '';
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
        grid: {
          left: '10%',
          right: '10%',
          bottom: showDataZoom ? '15%' : '10%'
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.name),
          boundaryGap: true,
          nameGap: 30,
          splitArea: {
            show: false
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          name: yAxisName,
          splitArea: {
            show: true
          }
        },
        dataZoom: showDataZoom ? [
          {
            type: 'slider',
            show: true,
            xAxisIndex: [0],
            start: 0,
            end: 100
          }
        ] : undefined,
        series: [
          {
            name: '箱线图',
            type: 'boxplot',
            data: boxplotData.map((item, index) => ({
              value: item,
              itemStyle: {
                color: data[index].itemStyle?.color || CHART_COLORS[index % CHART_COLORS.length],
                borderColor: data[index].itemStyle?.borderColor || CHART_COLORS[index % CHART_COLORS.length]
              }
            })),
            markLine: showMarkLine ? {
              data: [
                { type: 'average', name: '平均值' }
              ]
            } : undefined
          },
          ...(showOutliers ? [{
            name: '异常值',
            type: 'scatter',
            data: outlierData.flat(),
            itemStyle: {
              color: '#d63031'
            }
          }] : [])
        ]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, yAxisName, showDataZoom, showToolbox, showOutliers, showMarkLine]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ height: '500px', width: '100%' }} />
      <div className="absolute bottom-4 right-4 space-x-2">
        <button
          className="px-2 py-1 text-sm bg-white rounded shadow hover:bg-gray-50"
          onClick={() => {
            if (chartInstance.current) {
              const option = chartInstance.current.getOption();
              const showOutliers = option.series.length > 1;
              
              if (showOutliers) {
                option.series = [option.series[0]];
              } else {
                const outlierData = calculateOutliers(data);
                option.series.push({
                  name: '异常值',
                  type: 'scatter',
                  data: outlierData.flat(),
                  itemStyle: {
                    color: '#d63031'
                  }
                });
              }
              
              chartInstance.current.setOption(option);
            }
          }}
        >
          切换异常值显示
        </button>
      </div>
    </div>
  );
};

// 计算分位数
const calculateQuantile = (data: number[], q: number): number => {
  const sorted = [...data].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
};

// 计算异常值
const calculateOutliers = (data: BoxplotData[]): Array<Array<[number, number]>> => {
  return data.map((item, index) => {
    const sortedData = [...item.data].sort((a, b) => a - b);
    const q1 = calculateQuantile(sortedData, 0.25);
    const q3 = calculateQuantile(sortedData, 0.75);
    const iqr = q3 - q1;
    
    return item.data
      .map((value, i) => {
        if (value < q1 - 1.5 * iqr || value > q3 + 1.5 * iqr) {
          return [index, value];
        }
        return null;
      })
      .filter(Boolean) as Array<[number, number]>;
  });
};

export default BoxplotChart; 