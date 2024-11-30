import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addBudgetRule, getBudgetRules, getBudgetAnalytics } from '../services/advancedBudgetService';
import { DEFAULT_CATEGORIES } from '../constants';
import { toast } from 'react-hot-toast';

const BudgetRules: React.FC = () => {
  const { currentUser } = useAuth();
  const [rules, setRules] = useState<BudgetRule[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [newRule, setNewRule] = useState({
    category: '',
    maxAmount: 0,
    period: 'monthly' as const,
    action: 'warn' as const
  });

  useEffect(() => {
    if (currentUser) {
      loadRules();
      loadAnalytics();
    }
  }, [currentUser]);

  const loadRules = async () => {
    try {
      const rulesData = await getBudgetRules(currentUser!.uid);
      setRules(rulesData);
    } catch (error) {
      toast.error('加载预算规则失败');
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await getBudgetAnalytics(currentUser!.uid, 'month');
      setAnalytics(analyticsData);
    } catch (error) {
      toast.error('加载预算分析失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addBudgetRule({
        ...newRule,
        userId: currentUser!.uid
      });
      toast.success('预算规则添加成功');
      loadRules();
      setNewRule({
        category: '',
        maxAmount: 0,
        period: 'monthly',
        action: 'warn'
      });
    } catch (error) {
      toast.error('添加预算规则失败');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          添加预算规则
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              类别
            </label>
            <select
              value={newRule.category}
              onChange={(e) => setNewRule({ ...newRule, category: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300"
              required
            >
              <option value="">选择类别</option>
              {DEFAULT_CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              最大金额
            </label>
            <input
              type="number"
              value={newRule.maxAmount}
              onChange={(e) => setNewRule({ ...newRule, maxAmount: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              周期
            </label>
            <select
              value={newRule.period}
              onChange={(e) => setNewRule({ ...newRule, period: e.target.value as any })}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="daily">每日</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              动作
            </label>
            <select
              value={newRule.action}
              onChange={(e) => setNewRule({ ...newRule, action: e.target.value as any })}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="warn">警告</option>
              <option value="block">阻止</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            添加规则
          </button>
        </div>
      </form>

      {analytics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            预算分析
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.categoryAnalytics).map(([category, data]: [string, any]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {data.spent.toFixed(2)} / {data.budget.toFixed(2)}
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${Math.min(data.percentage, 100)}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        data.percentage > 100 ? 'bg-red-500' : 'bg-indigo-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {analytics.warnings.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md">
              <h4 className="text-sm font-medium text-yellow-800">预算警告</h4>
              <ul className="mt-2 text-sm text-yellow-700">
                {analytics.warnings.map((warning: string, index: number) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BudgetRules; 