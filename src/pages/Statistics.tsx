import React from 'react';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  CanvasRenderer
]);

const Statistics: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('month');
  const [chartData, setChartData] = React.useState<any[]>([]);

  return (
    <div className="space-y-6">
      {/* 时间范围选择 */}
      <div className="flex space-x-4">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300"
        >
          <option value="week">本周</option>
          <option value="month">本月</option>
          <option value="year">本年</option>
        </select>
      </div>

      {/* 图表容器 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div id="statistics-chart" style={{ height: '400px' }}></div>
      </div>

      {/* 分类统计 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          分类统计
        </h2>
        <div className="space-y-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex justify-between items-center">
              <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
              <span className="text-gray-900 dark:text-white font-medium">
                ¥ {item.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Statistics; 