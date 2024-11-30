import { db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Budget } from '../types';

interface RecurringExpense {
  id?: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'monthly' | 'yearly';
  dueDay: number;
  userId: string;
  notifications: boolean;
}

interface BudgetRule {
  id?: string;
  userId: string;
  category: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  rollover: boolean;
  notifications: {
    enabled: boolean;
    threshold: number;
    frequency: 'immediately' | 'daily' | 'weekly';
  };
  startDate: Date;
  endDate?: Date;
  tags: string[];
  excludeCategories: string[];
  notes: string;
}

interface BudgetAllocation {
  category: string;
  planned: number;
  actual: number;
  remaining: number;
  percentage: number;
}

interface BudgetAnalytics {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  spendingRate: number;
  projectedOverspend: number;
  categoryAllocations: BudgetAllocation[];
  dailyAverage: number;
  recommendations: string[];
}

export const addRecurringExpense = async (expense: Omit<RecurringExpense, 'id'>) => {
  const docRef = await addDoc(collection(db, 'recurringExpenses'), {
    ...expense,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

export const addBudgetRule = async (rule: Omit<BudgetRule, 'id'>) => {
  const docRef = await addDoc(collection(db, 'budgetRules'), {
    ...rule,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

export const getRecurringExpenses = async (userId: string): Promise<RecurringExpense[]> => {
  const q = query(
    collection(db, 'recurringExpenses'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as RecurringExpense));
};

export const getBudgetRules = async (userId: string): Promise<BudgetRule[]> => {
  const q = query(
    collection(db, 'budgetRules'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as BudgetRule));
};

export const updateBudgetAllocation = async (
  budgetId: string,
  allocations: Record<string, number>
) => {
  const budgetRef = doc(db, 'budgets', budgetId);
  await updateDoc(budgetRef, {
    categoryAllocations: allocations,
    updatedAt: new Date()
  });
};

export const getBudgetAnalytics = async (userId: string, period: string) => {
  const budgets = await getBudgetRules(userId);
  const expenses = await getExpenses(userId, new Date(), new Date());
  
  const analytics = {
    totalBudget: 0,
    totalSpent: 0,
    categoryAnalytics: {} as Record<string, {
      budget: number;
      spent: number;
      remaining: number;
      percentage: number;
    }>,
    warnings: [] as string[]
  };

  // 计算每个类别的支出情况
  budgets.forEach(budget => {
    const categoryExpenses = expenses.filter(e => e.category === budget.category);
    const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    analytics.totalBudget += budget.maxAmount;
    analytics.totalSpent += spent;
    
    analytics.categoryAnalytics[budget.category] = {
      budget: budget.maxAmount,
      spent,
      remaining: budget.maxAmount - spent,
      percentage: (spent / budget.maxAmount) * 100
    };

    if (spent > budget.maxAmount) {
      analytics.warnings.push(`${budget.category}类别支出超出预算${((spent/budget.maxAmount - 1) * 100).toFixed(1)}%`);
    }
  });

  return analytics;
};

export const generateBudgetRecommendations = async (userId: string) => {
  const expenses = await getExpenses(userId, new Date(), new Date());
  const categories = [...new Set(expenses.map(e => e.category))];
  
  const recommendations = categories.map(category => {
    const categoryExpenses = expenses.filter(e => e.category === category);
    const average = categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length;
    const max = Math.max(...categoryExpenses.map(e => e.amount));
    const min = Math.min(...categoryExpenses.map(e => e.amount));
    
    return {
      category,
      recommendedBudget: average * 1.1, // 建议预算比平均值高10%
      historicalAverage: average,
      maxSpent: max,
      minSpent: min,
      frequency: categoryExpenses.length
    };
  });

  return recommendations;
};

export const createBudgetRule = async (rule: Omit<BudgetRule, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, 'budgetRules'), {
    ...rule,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

export const updateBudgetRule = async (
  ruleId: string,
  updates: Partial<BudgetRule>
): Promise<void> => {
  const ruleRef = doc(db, 'budgetRules', ruleId);
  await updateDoc(ruleRef, {
    ...updates,
    updatedAt: new Date()
  });
};

export const analyzeBudget = async (userId: string): Promise<BudgetAnalytics> => {
  const rules = await getBudgetRules(userId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const expenses = await getExpenses(userId, startOfMonth, now);

  const totalBudget = rules.reduce((sum, rule) => sum + rule.amount, 0);
  const totalSpent = expenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const remainingBudget = totalBudget - totalSpent;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysPassed = now.getDate();
  const spendingRate = totalSpent / daysPassed;
  const projectedSpending = spendingRate * daysInMonth;
  const projectedOverspend = Math.max(0, projectedSpending - totalBudget);

  const categoryAllocations = rules.map(rule => {
    const categoryExpenses = expenses
      .filter(e => e.type === 'expense' && e.category === rule.category)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      category: rule.category,
      planned: rule.amount,
      actual: categoryExpenses,
      remaining: rule.amount - categoryExpenses,
      percentage: (categoryExpenses / rule.amount) * 100
    };
  });

  const recommendations = generateBudgetRecommendations(
    categoryAllocations,
    spendingRate,
    projectedOverspend
  );

  return {
    totalBudget,
    totalSpent,
    remainingBudget,
    spendingRate,
    projectedOverspend,
    categoryAllocations,
    dailyAverage: spendingRate,
    recommendations
  };
};

const generateBudgetRecommendations = (
  allocations: BudgetAllocation[],
  spendingRate: number,
  projectedOverspend: number
): string[] => {
  const recommendations: string[] = [];

  // 检查超支类别
  const overspentCategories = allocations.filter(a => a.percentage > 100);
  if (overspentCategories.length > 0) {
    recommendations.push(
      `以下类别已超出预算：${overspentCategories.map(c => c.category).join('、')}`
    );
  }

  // 检查接近预算限制的类别
  const nearLimitCategories = allocations.filter(a => a.percentage >= 80 && a.percentage < 100);
  if (nearLimitCategories.length > 0) {
    recommendations.push(
      `以下类别接近预算限制：${nearLimitCategories.map(c => c.category).join('、')}`
    );
  }

  // 支出速度分析
  if (projectedOverspend > 0) {
    recommendations.push(
      `按当前支出速度，本月可能超支${formatCurrency(projectedOverspend)}。建议适当控制支出。`
    );
  }

  // 预算分配建议
  const underutilizedCategories = allocations.filter(a => a.percentage < 50);
  if (underutilizedCategories.length > 0) {
    recommendations.push(
      `以下类别预算使用率较低，可考虑调整分配：${underutilizedCategories.map(c => c.category).join('、')}`
    );
  }

  return recommendations;
};

export const adjustBudgetAllocation = async (
  userId: string,
  adjustments: Record<string, number>
): Promise<void> => {
  const rules = await getBudgetRules(userId);
  
  for (const rule of rules) {
    if (adjustments[rule.category]) {
      await updateBudgetRule(rule.id!, {
        amount: adjustments[rule.category]
      });
    }
  }
};

export const generateBudgetReport = async (userId: string): Promise<BudgetAnalytics> => {
  const analytics = await analyzeBudget(userId);
  return analytics;
}; 