import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getExpenses } from '../services/expenseService';
import { exportToCSV, exportToJSON } from '../utils/exportData';
import { useTheme } from '../contexts/ThemeContext';
import ImportData from '../components/ImportData';
import { toast } from 'react-hot-toast';

const Settings: React.FC = () => {
  const [budget, setBudget] = React.useState({
    monthly: 0,
    categories: {} as Record<string, number>
  });
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleExportData = async (format: 'csv' | 'json') => {
    try {
      const startDate = new Date(new Date().getFullYear(), 0, 1); // 当年1月1日
      const endDate = new Date();
      const expenses = await getExpenses(currentUser!.uid, startDate, endDate);
      
      if (format === 'csv') {
        exportToCSV(expenses);
      } else {
        exportToJSON(expenses);
      }
    } catch (error) {
      console.error('导出数据失败:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 预算设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          预算设置
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              月度总预算
            </label>
            <input
              type="number"
              value={budget.monthly}
              onChange={(e: any) => setBudget({ ...budget, monthly: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300"
              placeholder="请输入月度预算"
            />
          </div>
        </div>
      </div>

      {/* 主题设置 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          显示设置
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">深色模式</span>
            <button
              onClick={toggleTheme}
              className={`${
                theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
            >
              <span
                className={`${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 数据管理 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          数据管理
        </h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              导入数据
            </h3>
            <ImportData
              onSuccess={() => toast.success('数据导入成功')}
              onError={(error: any) => toast.error(error)}
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              导出数据
            </h3>
            <div className="flex space-x-4">
              <button
                onClick={() => handleExportData('csv')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                导出为CSV
              </button>
              <button
                onClick={() => handleExportData('json')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                导出为JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 