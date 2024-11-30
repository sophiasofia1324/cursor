import { Expense } from '../types';
import { getExpenses } from './expenseService';
import { getDateRange } from '../utils/helpers';

interface ExpenseAnalytics {
  totalExpense: number;
  totalIncome: number;
  netSavings: number;
  categoryBreakdown: Record<string, number>;
  dailyAverage: number;
  monthlyTrend: Array<{
    month: string;
    expense: number;
    income: number;
  }>;
  topExpenses: Expense[];
  savingsRate: number;
}

export const analyzeExpenses = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<ExpenseAnalytics> => {
  const expenses = await getExpenses(userId, startDate, endDate);
  
  const totalExpense = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const netSavings = totalIncome - totalExpense;

  const categoryBreakdown = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const dailyAverage = totalExpense / dayCount;

  // 按月统计趋势
  const monthlyData = expenses.reduce((acc, e) => {
    const monthKey = `${e.date.getFullYear()}-${(e.date.getMonth() + 1).toString().padStart(2, '0')}`;
    if (!acc[monthKey]) {
      acc[monthKey] = { expense: 0, income: 0 };
    }
    if (e.type === 'expense') {
      acc[monthKey].expense += e.amount;
    } else {
      acc[monthKey].income += e.amount;
    }
    return acc;
  }, {} as Record<string, { expense: number; income: number }>);

  const monthlyTrend = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month,
      ...data
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const topExpenses = expenses
    .filter(e => e.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return {
    totalExpense,
    totalIncome,
    netSavings,
    categoryBreakdown,
    dailyAverage,
    monthlyTrend,
    topExpenses,
    savingsRate
  };
};

export const generateInsights = (analytics: ExpenseAnalytics): string[] => {
  const insights: string[] = [];

  // 总体财务状况
  if (analytics.savingsRate >= 30) {
    insights.push('👍 您的储蓄率很好，继续保持！');
  } else if (analytics.savingsRate < 0) {
    insights.push('⚠️ 注意：支出超过收入，建议控制支出');
  }

  // 分类支出分析
  const sortedCategories = Object.entries(analytics.categoryBreakdown)
    .sort(([, a], [, b]) => b - a);

  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0];
    insights.push(`📊 最大支出类别是${topCategory}，占总支出的${((topAmount / analytics.totalExpense) * 100).toFixed(1)}%`);
  }

  // 日均支出分析
  if (analytics.dailyAverage > analytics.totalIncome / 60) { // 假设每月30天
    insights.push('💡 日均支出较高，建议制定预算计划');
  }

  // 趋势分析
  if (analytics.monthlyTrend.length >= 2) {
    const lastTwo = analytics.monthlyTrend.slice(-2);
    const expenseTrend = lastTwo[1].expense - lastTwo[0].expense;
    if (expenseTrend > 0) {
      insights.push(`📈 支出呈上升趋势，本月比上月增加了${expenseTrend.toFixed(2)}元`);
    } else if (expenseTrend < 0) {
      insights.push(`📉 支出呈下降趋势，本月比上月减少了${Math.abs(expenseTrend).toFixed(2)}元`);
    }
  }

  return insights;
}; 