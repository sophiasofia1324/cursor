// 颜色常量
export const CHART_COLORS = {
  primary: '#4F46E5',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  success: '#10B981',
  gray: '#6B7280',
} as const;

// 类别常量
export const EXPENSE_CATEGORIES = [
  '食品',
  '交通',
  '住房',
  '娱乐',
  '医疗',
  '教育',
  '购物',
  '其他'
] as const;

export const INCOME_CATEGORIES = [
  '工资',
  '奖金',
  '投资',
  '其他'
] as const;

// 时间范围常量
export const TIME_RANGES = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  CUSTOM: 'custom'
} as const;

// 图表类型常量
export const CHART_TYPES = {
  PIE: 'pie',
  LINE: 'line',
  BAR: 'bar',
  RADAR: 'radar',
  SCATTER: 'scatter'
} as const;

// 主题常量
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;

// 语言常量
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US'
} as const;

// 货币常量
export const CURRENCIES = {
  CNY: 'CNY',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY'
} as const;

// 状态常量
export const STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

// 错误代码常量
export const ERROR_CODES = {
  UNAUTHORIZED: 'unauthorized',
  NOT_FOUND: 'not_found',
  VALIDATION_ERROR: 'validation_error',
  SERVER_ERROR: 'server_error'
} as const; 