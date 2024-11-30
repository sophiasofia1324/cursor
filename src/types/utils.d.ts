// 日期工具
export interface DateUtils {
  format(date: Date, format: string): string;
  parse(dateStr: string, format: string): Date;
  addDays(date: Date, days: number): Date;
  startOf(date: Date, unit: 'day' | 'week' | 'month' | 'year'): Date;
  endOf(date: Date, unit: 'day' | 'week' | 'month' | 'year'): Date;
}

// 货币工具
export interface CurrencyUtils {
  format(amount: number, currency?: string): string;
  parse(amountStr: string): number;
  convert(amount: number, from: string, to: string): Promise<number>;
}

// 数据验证工具
export interface ValidationUtils {
  isEmail(value: string): boolean;
  isNumber(value: any): boolean;
  isRequired(value: any): boolean;
  validate(value: any, rules: ValidationRule[]): string[];
}

// 存储工具
export interface StorageUtils {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
} 