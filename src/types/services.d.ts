import { User, Expense, Budget, Category } from './models';

// 认证服务
export interface AuthService {
  login(email: string, password: string): Promise<User>;
  register(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

// 支出服务
export interface ExpenseService {
  getExpenses(userId: string, startDate: Date, endDate: Date): Promise<Expense[]>;
  addExpense(expense: Omit<Expense, 'id'>): Promise<string>;
  updateExpense(id: string, expense: Partial<Expense>): Promise<void>;
  deleteExpense(id: string): Promise<void>;
}

// 预算服务
export interface BudgetService {
  getBudgets(userId: string): Promise<Budget[]>;
  setBudget(budget: Omit<Budget, 'id'>): Promise<string>;
  updateBudget(id: string, budget: Partial<Budget>): Promise<void>;
  deleteBudget(id: string): Promise<void>;
}

// 分析服务
export interface AnalyticsService {
  getExpenseStats(userId: string, period: string): Promise<{
    total: number;
    byCategory: Record<string, number>;
    trend: Array<{
      date: string;
      amount: number;
    }>;
  }>;
  getBudgetStatus(userId: string): Promise<{
    used: number;
    total: number;
    byCategory: Record<string, {
      used: number;
      total: number;
    }>;
  }>;
} 