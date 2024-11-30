import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { MapChart as EChartsMap } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GeoComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { CHART_COLORS } from '../../constants';

echarts.use([
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GeoComponent,
  EChartsMap,
  CanvasRenderer
]);

import chinaGeoJson from '../../assets/china.json';
echarts.registerMap('china', chinaGeoJson);

interface MapData {
  name: string;
  value: number;
}

interface MapChartProps {
  data: MapData[];
  title?: string;
  height?: number;
}

const MapChart: React.FC<MapChartProps> = ({
  data,
  title = '地图',
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
        trigger: 'item'
      },
      visualMap: {
        min: 0,
        max: Math.max(...data.map(item => item.value)),
        left: 'left',
        top: 'bottom',
        text: ['高', '低'],
        calculable: true,
        inRange: {
          color: [CHART_COLORS[0], CHART_COLORS[1]]
        }
      },
      series: [
        {
          name: title,
          type: 'map',
          map: 'china',
          label: {
            show: true
          },
          data
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

export default MapChart; 