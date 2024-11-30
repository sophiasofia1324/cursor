export interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface User extends BaseModel {
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences: UserPreferences;
}

export interface Expense extends BaseModel {
  type: 'expense' | 'income';
  amount: number;
  category: string;
  date: Date;
  note?: string;
  imageUrl?: string;
  tags?: string[];
}

export interface Budget extends BaseModel {
  monthly: number;
  categoryLimits: Record<string, number>;
  notifications: boolean;
  categories: Record<string, number>;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface Category extends BaseModel {
  name: string;
  icon?: string;
  type: 'expense' | 'income';
  color?: string;
}

export type Period = 'day' | 'week' | 'month' | 'year';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface ChartData {
  title: string;
  data: Array<{
    name: string;
    value: number;
  }>;
  series?: Array<{
    name: string;
    data: number[];
  }>;
  xAxis?: string[];
}

export interface LineChartProps {
  data: ChartData;
  title: string;
}

export interface UserPreferences extends BaseModel {
  theme: 'light' | 'dark';
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    budgetAlerts: boolean;
  };
}

export interface Notification extends BaseModel {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  read: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface FilterParams {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: 'expense' | 'income';
  minAmount?: number;
  maxAmount?: number;
}

export interface Statistics {
  totalExpense: number;
  totalIncome: number;
  balance: number;
  categoryBreakdown: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    expense: number;
    income: number;
  }>;
}

export interface ImportExportData {
  expenses: Expense[];
  budgets: Budget[];
  preferences: UserPreferences;
}

export interface AppError extends Error {
  code?: string;
  details?: Record<string, any>;
}

export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'radar';
export type ChartTheme = 'light' | 'dark';
export type ChartOption = any;

export type Timeout = any;
export type IDBPDatabase = any;
export type EChartsInstance = any; 