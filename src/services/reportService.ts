import { Expense } from '../types';
import { getExpenses } from './expenseService';
import { formatCurrency } from '../utils/helpers';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReportOptions {
  format: 'pdf' | 'excel';
  type: 'monthly' | 'yearly' | 'custom';
  startDate: Date;
  endDate: Date;
  includeCharts?: boolean;
  categories?: string[];
}

interface ReportData {
  summary: {
    totalExpense: number;
    totalIncome: number;
    netSavings: number;
    savingsRate: number;
  };
  categoryBreakdown: Record<string, number>;
  dailyAverage: number;
  topExpenses: Expense[];
  monthlyTrend: Array<{
    month: string;
    expense: number;
    income: number;
  }>;
}

export const generateReport = async (userId: string, options: ReportOptions): Promise<Blob> => {
  const expenses = await getExpenses(userId, options.startDate, options.endDate);
  const reportData = await analyzeData(expenses);

  return options.format === 'pdf' 
    ? generatePDFReport(reportData, options)
    : generateExcelReport(reportData, options);
};

const analyzeData = async (expenses: Expense[]): Promise<ReportData> => {
  const totalExpense = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = expenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  const categoryBreakdown = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {} as Record<string, number>);

  const dayCount = Math.ceil(
    (expenses[expenses.length - 1].date.getTime() - expenses[0].date.getTime()) / 
    (1000 * 60 * 60 * 24)
  );

  return {
    summary: {
      totalExpense,
      totalIncome,
      netSavings,
      savingsRate
    },
    categoryBreakdown,
    dailyAverage: totalExpense / dayCount,
    topExpenses: expenses
      .filter(e => e.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10),
    monthlyTrend: calculateMonthlyTrend(expenses)
  };
};

const generatePDFReport = async (data: ReportData, options: ReportOptions): Promise<Blob> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // 添加标题
  doc.setFontSize(20);
  doc.text('支出报告', pageWidth / 2, 20, { align: 'center' });

  // 添加日期范围
  doc.setFontSize(12);
  doc.text(
    `报告期间: ${options.startDate.toLocaleDateString()} - ${options.endDate.toLocaleDateString()}`,
    pageWidth / 2,
    30,
    { align: 'center' }
  );

  // 添加总结
  doc.setFontSize(14);
  doc.text('总体概况', 20, 45);
  doc.setFontSize(12);
  doc.text(`总支出: ${formatCurrency(data.summary.totalExpense)}`, 30, 55);
  doc.text(`总收入: ${formatCurrency(data.summary.totalIncome)}`, 30, 65);
  doc.text(`净储蓄: ${formatCurrency(data.summary.netSavings)}`, 30, 75);
  doc.text(`储蓄率: ${data.summary.savingsRate.toFixed(1)}%`, 30, 85);
  doc.text(`日均支出: ${formatCurrency(data.dailyAverage)}`, 30, 95);

  // 添加类别统计
  doc.setFontSize(14);
  doc.text('类别统计', 20, 110);
  const categoryData = Object.entries(data.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => [
      category,
      formatCurrency(amount),
      `${((amount / data.summary.totalExpense) * 100).toFixed(1)}%`
    ]);

  (doc as any).autoTable({
    startY: 120,
    head: [['类别', '金额', '占比']],
    body: categoryData
  });

  // 添加最大支出记录
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.setFontSize(14);
  doc.text('最大支出记录', 20, finalY + 20);

  const expenseData = data.topExpenses.map(expense => [
    new Date(expense.date).toLocaleDateString(),
    expense.category,
    formatCurrency(expense.amount),
    expense.note || ''
  ]);

  (doc as any).autoTable({
    startY: finalY + 30,
    head: [['日期', '类别', '金额', '备注']],
    body: expenseData
  });

  return doc.output('blob');
};

const generateExcelReport = (data: ReportData, options: ReportOptions): Blob => {
  const wb = XLSX.utils.book_new();

  // 总体概况表
  const summaryData = [
    ['总体概况'],
    ['总支出', data.summary.totalExpense],
    ['总收入', data.summary.totalIncome],
    ['净储蓄', data.summary.netSavings],
    ['储蓄率', `${data.summary.savingsRate.toFixed(1)}%`],
    ['日均支出', data.dailyAverage],
    [],
    ['类别统计'],
    ['类别', '金额', '占比']
  ];

  Object.entries(data.categoryBreakdown)
    .sort(([, a], [, b]) => b - a)
    .forEach(([category, amount]) => {
      summaryData.push([
        category,
        amount,
        `${((amount / data.summary.totalExpense) * 100).toFixed(1)}%`
      ]);
    });

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, '总体概况');

  // 最大支出记录表
  const expenseData = [
    ['最大支出记录'],
    ['日期', '类别', '金额', '备注']
  ];

  data.topExpenses.forEach(expense => {
    expenseData.push([
      new Date(expense.date).toLocaleDateString(),
      expense.category,
      expense.amount,
      expense.note || ''
    ]);
  });

  const expenseWs = XLSX.utils.aoa_to_sheet(expenseData);
  XLSX.utils.book_append_sheet(wb, expenseWs, '最大支出');

  // 月度趋势表
  const trendData = [
    ['月度趋势'],
    ['月份', '支出', '收入']
  ];

  data.monthlyTrend.forEach(trend => {
    trendData.push([trend.month, trend.expense, trend.income]);
  });

  const trendWs = XLSX.utils.aoa_to_sheet(trendData);
  XLSX.utils.book_append_sheet(wb, trendWs, '月度趋势');

  // 生成Excel文件
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

const calculateMonthlyTrend = (expenses: Expense[]): Array<{month: string; expense: number; income: number}> => {
  const monthlyData: Record<string, { expense: number; income: number }> = {};

  expenses.forEach(expense => {
    const month = expense.date.toISOString().slice(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { expense: 0, income: 0 };
    }
    if (expense.type === 'expense') {
      monthlyData[month].expense += expense.amount;
    } else {
      monthlyData[month].income += expense.amount;
    }
  });

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      ...data
    }));
}; 