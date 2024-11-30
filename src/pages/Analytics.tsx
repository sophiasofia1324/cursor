import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyzeExpenses, generateInsights } from '../services/analyticsService';
import { formatCurrency } from '../utils/helpers';
import { Period } from '../types';
import { PERIODS } from '../constants';
import LineChart from '../components/LineChart';
import PieChart from '../components/PieChart';

const Analytics: React.FC = () => {
  const { currentUser } = useAuth();
  const [period, setPeriod] = useState<Period>('month');
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!currentUser) return;

      setLoading(true);
      try {
        const now = new Date();
        const startDate = new Date();
        
        switch (period) {
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          default:
            startDate.setDate(startDate.getDate() - 30);
        }

        const data = await analyzeExpenses(currentUser.uid, startDate, now);
        setAnalytics(data);
        setInsights(generateInsights(data));
      } catch (error) {
        console.error('加载分析数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [currentUser, period]);

  if (loading || !analytics) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 时间范围选择 */}
      <div className="flex justify-end">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="rounded-md border-gray-300"
        >
          {PERIODS.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* 关键指标 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">总支出</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {formatCurrency(analytics.totalExpense)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">总收入</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {formatCurrency(analytics.totalIncome)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">净储蓄</h3>
          <p className={`mt-2 text-3xl font-bold ${
            analytics.netSavings >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatCurrency(analytics.netSavings)}
          </p>
        </div>
      </div>

      {/* 洞察建议 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          财务洞察
        </h3>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <p key={index} className="text-gray-600 dark:text-gray-300">
              {insight}
            </p>
          ))}
        </div>
      </div>

      {/* 支出趋势图 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          收支趋势
        </h3>
        <LineChart
          data={{
            xAxis: analytics.monthlyTrend.map(t => t.month),
            series: [
              {
                name: '支出',
                data: analytics.monthlyTrend.map(t => t.expense)
              },
              {
                name: '收入',
                data: analytics.monthlyTrend.map(t => t.income)
              }
            ]
          }}
        />
      </div>

      {/* 分类支出饼图 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          支出分布
        </h3>
        <PieChart
          data={Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({
            name,
            value: value as number
          }))}
        />
      </div>

      {/* 最大支出记录 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          最大支出记录
        </h3>
        <div className="space-y-4">
          {analytics.topExpenses.map((expense: any) => (
            <div
              key={expense.id}
              className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {expense.category}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(expense.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics; 