import React, { useState } from 'react';
import { Expense } from '../types';

const ExpenseForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<Expense>>({
    type: 'expense',
    date: new Date(),
    amount: 0,
    category: '',
    note: ''
  });

  const categories = [
    '餐饮', '交通', '购物', '娱乐', '居住', '医疗', '教育', '其他'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 实现提交逻辑
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          类型
        </label>
        <select
          value={formData.type}
          onChange={(e: any) => setFormData({...formData, type: e.target.value as 'expense' | 'income'})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="expense">支出</option>
          <option value="income">收入</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          金额
        </label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e: any) => setFormData({...formData, amount: parseFloat(e.target.value)})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="请输入金额"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          日期
        </label>
        <input
          type="date"
          value={formData.date?.toISOString().split('T')[0]}
          onChange={(e: any) => setFormData({...formData, date: new Date(e.target.value)})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          类别
        </label>
        <select
          value={formData.category}
          onChange={(e: any) => setFormData({...formData, category: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">请选择类别</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          备注
        </label>
        <textarea
          value={formData.note}
          onChange={(e: any) => setFormData({...formData, note: e.target.value})}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          rows={3}
          placeholder="添加备注信息"
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        保存
      </button>
    </form>
  );
};

export default ExpenseForm; 