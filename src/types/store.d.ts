import { User, Expense, Budget } from './models';

// 全局状态
export interface RootState {
  auth: AuthState;
  expenses: ExpensesState;
  budgets: BudgetsState;
  ui: UIState;
}

// 认证状态
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// 支出状态
export interface ExpensesState {
  items: Expense[];
  loading: boolean;
  error: string | null;
  filters: {
    startDate: Date;
    endDate: Date;
    category?: string;
    type?: 'expense' | 'income';
  };
}

// 预算状态
export interface BudgetsState {
  items: Budget[];
  loading: boolean;
  error: string | null;
}

// UI状态
export interface UIState {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
  }>;
} 