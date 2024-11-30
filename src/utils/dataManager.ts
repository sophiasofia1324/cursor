interface ExpenseRecord {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string;
  tags?: string[];
  attachments?: string[];
  merchant?: string;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    endDate?: Date;
  };
}

interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  notifications?: boolean;
}

export class DataManager {
  private static instance: DataManager;
  private expenses: Map<string, ExpenseRecord> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private categories: Set<string> = new Set(['餐饮', '交通', '购物', '娱乐']);

  static getInstance() {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  // 支出记录管理
  async addExpense(expense: Omit<ExpenseRecord, 'id'>): Promise<string> {
    const id = Date.now().toString();
    const record = { ...expense, id };
    this.expenses.set(id, record as ExpenseRecord);
    await this.sync();
    return id;
  }

  async getExpenses(filters: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    tags?: string[];
  }): Promise<ExpenseRecord[]> {
    let records = Array.from(this.expenses.values());

    if (filters.startDate) {
      records = records.filter(r => r.date >= filters.startDate!);
    }
    if (filters.endDate) {
      records = records.filter(r => r.date <= filters.endDate!);
    }
    if (filters.category) {
      records = records.filter(r => r.category === filters.category);
    }
    if (filters.tags) {
      records = records.filter(r => 
        r.tags?.some(tag => filters.tags!.includes(tag))
      );
    }

    return records;
  }

  // 预算管理
  async setBudget(budget: Omit<Budget, 'id'>): Promise<string> {
    const id = Date.now().toString();
    const newBudget = { ...budget, id };
    this.budgets.set(id, newBudget as Budget);
    await this.sync();
    return id;
  }

  async checkBudget(category: string): Promise<{
    spent: number;
    budget: number;
    remaining: number;
  }> {
    const budget = Array.from(this.budgets.values())
      .find(b => b.category === category);
    
    if (!budget) return { spent: 0, budget: 0, remaining: 0 };

    const expenses = await this.getExpenses({
      category,
      startDate: budget.startDate,
      endDate: budget.endDate
    });

    const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      spent,
      budget: budget.amount,
      remaining: budget.amount - spent
    };
  }

  // 分类管理
  addCategory(category: string) {
    this.categories.add(category);
  }

  getCategories(): string[] {
    return Array.from(this.categories);
  }

  // 统计分析
  async getStatistics(period: 'day' | 'week' | 'month' | 'year') {
    const now = new Date();
    let startDate = new Date();

    switch (period) {
      case 'day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - now.getDay());
        break;
      case 'month':
        startDate.setDate(1);
        break;
      case 'year':
        startDate.setMonth(0, 1);
        break;
    }

    const expenses = await this.getExpenses({ startDate, endDate: now });
    
    return {
      total: expenses.reduce((sum, e) => sum + e.amount, 0),
      byCategory: this.groupByCategory(expenses),
      trend: this.calculateTrend(expenses, period)
    };
  }

  private groupByCategory(expenses: ExpenseRecord[]) {
    return expenses.reduce((acc, expense) => {
      const { category, amount } = expense;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);
  }

  private calculateTrend(expenses: ExpenseRecord[], period: string) {
    // 实现趋势计算逻辑
    return [];
  }

  private async sync() {
    // 实现与离线管理器和设备同步管理器的集成
  }
}

export const dataManager = DataManager.getInstance(); 