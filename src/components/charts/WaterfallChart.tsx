import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer
]);

interface WaterfallData {
  name: string;
  value: number;
  itemStyle?: {
    color?: string;
  };
}

interface WaterfallChartProps {
  data: WaterfallData[];
  title?: string;
  positiveColor?: string;
  negativeColor?: string;
  totalColor?: string;
  showTotal?: boolean;
}

const WaterfallChart: React.FC<WaterfallChartProps> = ({
  data,
  title,
  positiveColor = '#34d399',
  negativeColor = '#f87171',
  totalColor = '#60a5fa',
  showTotal = true
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      // 计算累计值
      let sum = 0;
      const values = data.map(item => {
        const currentSum = sum;
        sum += item.value;
        return {
          name: item.name,
          value: item.value,
          currentSum
        };
      });

      if (showTotal) {
        values.push({
          name: '总计',
          value: sum,
          currentSum: 0,
          itemStyle: {
            color: totalColor
          }
        });
      }

      const option = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params: any) => {
            const item = params[0];
            const data = values[item.dataIndex];
            if (data.name === '总计') {
              return `${data.name}: ${formatCurrency(data.value)}`;
            }
            return `${data.name}<br/>
              变化: ${formatCurrency(data.value)}<br/>
              累计: ${formatCurrency(data.currentSum + data.value)}`;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: values.map(item => item.name),
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '辅助',
            type: 'bar',
            stack: '总量',
            itemStyle: {
              borderColor: 'transparent',
              color: 'transparent'
            },
            data: values.map(item => item.currentSum)
          },
          {
            name: '数值',
            type: 'bar',
            stack: '总量',
            label: {
              show: true,
              position: 'top',
              formatter: (params: any) => {
                const value = values[params.dataIndex].value;
                return formatCurrency(value);
              }
            },
            data: values.map(item => ({
              value: item.value,
              itemStyle: {
                color: item.name === '总计' ? totalColor :
                  item.value >= 0 ? positiveColor : negativeColor
              }
            }))
          }
        ]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, positiveColor, negativeColor, totalColor, showTotal]);

  return <div ref={chartRef} style={{ height: '400px', width: '100%' }} />;
};

export default WaterfallChart; 