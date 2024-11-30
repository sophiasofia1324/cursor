import { DateRange, Period } from '../types';

export const formatCurrency = (
  amount: number,
  currency: string = 'CNY',
  locale: string = 'zh-CN'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const getDateRange = (period: Period): DateRange => {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'year':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  return { startDate, endDate };
};

export const formatDate = (
  date: Date,
  locale: string = 'zh-CN',
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
): string => {
  return new Intl.DateTimeFormat(locale, options).format(date);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
}; 