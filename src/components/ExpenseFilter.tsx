import React from 'react';
import { Period } from '../types';
import { PERIODS } from '../constants';

interface ExpenseFilterProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  minAmount?: number;
  onMinAmountChange: (amount: number) => void;
  maxAmount?: number;
  onMaxAmountChange: (amount: number) => void;
}

const ExpenseFilter: React.FC<ExpenseFilterProps> = ({
  period,
  onPeriodChange,
  category,
  onCategoryChange,
  categories,
  minAmount,
  onMinAmountChange,
  maxAmount,
  onMaxAmountChange
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            时间范围
          </label>
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value as Period)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            类别
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">全部</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            最小金额
          </label>
          <input
            type="number"
            value={minAmount || ''}
            onChange={(e) => onMinAmountChange(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="最小金额"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            最大金额
          </label>
          <input
            type="number"
            value={maxAmount || ''}
            onChange={(e) => onMaxAmountChange(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="最大金额"
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseFilter; 