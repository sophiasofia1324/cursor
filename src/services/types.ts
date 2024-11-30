export interface ExpenseService {
  getExpenses(userId: string, startDate: Date, endDate: Date): Promise<any[]>;
  getBudgets(userId: string): Promise<any[]>;
  getCategories(userId: string): Promise<any[]>;
}

export interface AnalyticsService {
  analyzeExpenseData(data: any[]): Promise<any>;
  analyzeCategoryPatterns(data: any[]): Promise<any>;
}

export interface NotificationService {
  createNotification(data: Omit<Notification, 'id' | 'createdAt'>): Promise<void>;
} 