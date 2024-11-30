import { toast } from 'react-hot-toast';
import { getBudget } from './budgetService';
import { getExpenses } from './expenseService';
import { formatCurrency } from '../utils/helpers';

export const checkBudgetStatus = async (userId: string) => {
  const budget = await getBudget(userId);
  if (!budget || !budget.notifications) return;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const expenses = await getExpenses(userId, startOfMonth, now);

  const totalExpense = expenses.reduce((sum, expense) => 
    expense.type === 'expense' ? sum + expense.amount : sum, 0
  );

  const budgetPercentage = (totalExpense / budget.amount) * 100;

  if (budgetPercentage >= 90) {
    toast.error(`警告：本月支出已达到预算的${budgetPercentage.toFixed(1)}%！`);
  } else if (budgetPercentage >= 80) {
    toast.warning(`提醒：本月支出已达到预算的${budgetPercentage.toFixed(1)}%`);
  }

  // 检查分类预算
  if (budget.categories) {
    Object.entries(budget.categories).forEach(([category, limit]) => {
      const categoryExpense = expenses
        .filter(e => e.type === 'expense' && e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);

      const categoryPercentage = (categoryExpense / limit) * 100;
      if (categoryPercentage >= 90) {
        toast.error(`警告：${category}支出已达到预算的${categoryPercentage.toFixed(1)}%！`);
      }
    });
  }
};

export const scheduleNotifications = (userId: string) => {
  // 每天检查一次预算状态
  const checkBudget = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
    setTimeout(() => {
      checkBudgetStatus(userId);
      checkBudget(); // 递归调用以设置下一天的检查
    }, timeUntilTomorrow);
  };

  // 立即检查一次，然后开始定时检查
  checkBudgetStatus(userId);
  checkBudget();
}; 