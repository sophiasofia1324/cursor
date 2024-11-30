import React, { useEffect, useState } from 'react';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import PieChart from '../components/PieChart';
import { useAuth } from '../contexts/AuthContext';
import { getExpenses } from '../services/expenseService';
import { Expense } from '../types';

echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer
]);

const Dashboard: React.FC = () => {
  const [totalExpense, setTotalExpense] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<Expense[]>([]);
  const [chartData, setChartData] = useState<{ name: string; value: number }[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;

      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();

      try {
        const expenses = await getExpenses(currentUser.uid, startDate, endDate);
        
        // 计算总支出
        const total = expenses.reduce((sum, expense) => 
          expense.type === 'expense' ? sum + expense.amount : sum, 0
        );
        setTotalExpense(total);
        
        // 设置最近交易
        setRecentTransactions(expenses.slice(0, 5));
        
        // 处理图表数据
        const categoryData = expenses.reduce((acc, expense) => {
          if (expense.type === 'expense') {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
          }
          return acc;
        }, {} as Record<string, number>);

        setChartData(
          Object.entries(categoryData).map(([name, value]) => ({
            name,
            value
          }))
        );
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };

    fetchData();
  }, [currentUser]);

  return (
    <div className="space-y-6">
      {/* 总支出卡片 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">本月总支出</h2>
        <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">
          ¥ {totalExpense.toFixed(2)}
        </p>
      </div>

      {/* 最近交易 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">最近交易</h2>
          <div className="mt-4 space-y-4">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.category}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  ¥ {transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 支出分布图表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          支出分布
        </h2>
        <PieChart data={chartData} title="本月支出分类" />
      </div>
    </div>
  );
};

export default Dashboard; 