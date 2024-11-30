import { Expense } from '../types';
import { getExpenses } from './expenseService';
import { getBudgetRules } from './advancedBudgetService';
import { formatCurrency } from '../utils/helpers';

interface AnalyticsResult {
  summary: {
    totalExpense: number;
    totalIncome: number;
    netSavings: number;
    savingsRate: number;
    monthlyAverage: number;
    monthOverMonthChange: number;
    yearOverYearChange: number;
  };
  patterns: {
    topCategories: Array<{
      category: string;
      amount: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    frequentMerchants: Array<{
      name: string;
      count: number;
      totalAmount: number;
      averageAmount: number;
    }>;
    spendingHabits: {
      weekdayDistribution: Record<string, number>;
      hourlyDistribution: Record<string, number>;
      seasonalTrends: Record<string, number>;
    };
  };
  predictions: {
    nextMonthExpense: number;
    categoryPredictions: Record<string, number>;
    savingsPotential: number;
    riskAreas: string[];
  };
  insights: {
    anomalies: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      suggestedAction: string;
    }>;
    trends: Array<{
      category: string;
      trend: string;
      percentage: number;
      period: string;
    }>;
    opportunities: Array<{
      type: string;
      description: string;
      potentialSavings: number;
      difficulty: 'easy' | 'medium' | 'hard';
    }>;
  };
}

export const analyzeExpenseData = async (
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<AnalyticsResult> => {
  const [expenses, budgetRules] = await Promise.all([
    getExpenses(userId, startDate, endDate),
    getBudgetRules(userId)
  ]);

  const summary = calculateSummary(expenses);
  const patterns = analyzePatterns(expenses);
  const predictions = generatePredictions(expenses, patterns);
  const insights = generateInsights(expenses, patterns, predictions, budgetRules);

  return {
    summary,
    patterns,
    predictions,
    insights
  };
};

const calculateSummary = (expenses: Expense[]): AnalyticsResult['summary'] => {
  const totalExpense = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // 计算月度变化
  const monthlyExpenses = groupExpensesByMonth(expenses);
  const monthlyChanges = calculateMonthlyChanges(monthlyExpenses);

  return {
    totalExpense,
    totalIncome,
    netSavings,
    savingsRate,
    monthlyAverage: totalExpense / Object.keys(monthlyExpenses).length,
    monthOverMonthChange: monthlyChanges.mom,
    yearOverYearChange: monthlyChanges.yoy
  };
};

const analyzePatterns = (expenses: Expense[]): AnalyticsResult['patterns'] => {
  // 分析类别分布
  const categoryStats = calculateCategoryStats(expenses);
  const topCategories = Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      amount: stats.total,
      percentage: stats.percentage,
      trend: determineTrend(stats.trend)
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // 分析商家频率
  const merchantStats = calculateMerchantStats(expenses);
  const frequentMerchants = Object.entries(merchantStats)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      totalAmount: stats.total,
      averageAmount: stats.total / stats.count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // 分析时间模式
  const spendingHabits = {
    weekdayDistribution: calculateWeekdayDistribution(expenses),
    hourlyDistribution: calculateHourlyDistribution(expenses),
    seasonalTrends: calculateSeasonalTrends(expenses)
  };

  return {
    topCategories,
    frequentMerchants,
    spendingHabits
  };
};

const generatePredictions = (
  expenses: Expense[],
  patterns: AnalyticsResult['patterns']
): AnalyticsResult['predictions'] => {
  // 使用时间序列分析预测下月支出
  const nextMonthExpense = predictNextMonthExpense(expenses);

  // 预测各类别支出
  const categoryPredictions = predictCategoryExpenses(expenses, patterns.topCategories);

  // 计算潜在节省
  const savingsPotential = calculateSavingsPotential(expenses, patterns);

  // 识别风险领域
  const riskAreas = identifyRiskAreas(expenses, patterns);

  return {
    nextMonthExpense,
    categoryPredictions,
    savingsPotential,
    riskAreas
  };
};

const generateInsights = (
  expenses: Expense[],
  patterns: AnalyticsResult['patterns'],
  predictions: AnalyticsResult['predictions'],
  budgetRules: any[]
): AnalyticsResult['insights'] => {
  // 检测异常
  const anomalies = detectAnomalies(expenses, patterns);

  // 分析趋势
  const trends = analyzeTrends(expenses, patterns);

  // 识别机会
  const opportunities = identifyOpportunities(expenses, patterns, predictions, budgetRules);

  return {
    anomalies,
    trends,
    opportunities
  };
};

// 辅助函数
const groupExpensesByMonth = (expenses: Expense[]): Record<string, Expense[]> => {
  return expenses.reduce((acc, expense) => {
    const monthKey = expense.date.toISOString().slice(0, 7);
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);
};

const calculateMonthlyChanges = (
  monthlyExpenses: Record<string, Expense[]>
): { mom: number; yoy: number } => {
  const months = Object.keys(monthlyExpenses).sort();
  if (months.length < 2) return { mom: 0, yoy: 0 };

  const currentMonth = months[months.length - 1];
  const lastMonth = months[months.length - 2];
  const lastYear = months.find(m => m.startsWith(currentMonth.slice(0, 4) - 1 + currentMonth.slice(4)));

  const currentTotal = calculateMonthTotal(monthlyExpenses[currentMonth]);
  const lastMonthTotal = calculateMonthTotal(monthlyExpenses[lastMonth]);
  const lastYearTotal = lastYear ? calculateMonthTotal(monthlyExpenses[lastYear]) : currentTotal;

  return {
    mom: ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100,
    yoy: ((currentTotal - lastYearTotal) / lastYearTotal) * 100
  };
};

const calculateMonthTotal = (expenses: Expense[]): number => {
  return expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
};

const determineTrend = (values: number[]): 'up' | 'down' | 'stable' => {
  if (values.length < 2) return 'stable';
  const change = ((values[values.length - 1] - values[0]) / values[0]) * 100;
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'stable';
};

// ... 其他辅助函数的实现 