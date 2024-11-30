import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { FunnelChart as EChartsFunnel } from 'echarts/charts';
import {
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';
import { formatCurrency } from '../../utils/helpers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  EChartsFunnel,
  CanvasRenderer
]);

interface FunnelData {
  name: string;
  value: number;
}

interface FunnelChartProps {
  data: FunnelData[];
  title?: string;
  sort?: 'ascending' | 'descending' | 'none';
  gap?: number;
}

const FunnelChart: React.FC<FunnelChartProps> = ({
  data,
  title,
  sort = 'descending',
  gap = 2
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
          formatter: '{b}: {c} ({d}%)'
        },
        legend: {
          data: data.map(item => item.name),
          bottom: 10
        },
        series: [{
          name: title,
          type: 'funnel',
          left: '10%',
          right: '10%',
          top: '10%',
          bottom: '10%',
          width: '80%',
          min: 0,
          max: Math.max(...data.map(item => item.value)),
          minSize: '0%',
          maxSize: '100%',
          sort,
          gap,
          label: {
            show: true,
            position: 'inside',
            formatter: (params: any) => {
              return `${params.name}\n${formatCurrency(params.value)}`;
            }
          },
          labelLine: {
            length: 10,
            lineStyle: {
              width: 1,
              type: 'solid'
            }
          },
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 1
          },
          emphasis: {
            label: {
              fontSize: 14
            }
          },
          data: data.map((item, index) => ({
            ...item,
            itemStyle: {
              color: CHART_COLORS[index % CHART_COLORS.length]
            }
          }))
        }]
      };

      chartInstance.current.setOption(option);
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, title, sort, gap]);

  return <div ref={chartRef} style={{ height: '400px', width: '100%' }} />;
};

export default FunnelChart; 