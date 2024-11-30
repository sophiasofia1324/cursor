export const DEFAULT_CATEGORIES = [
  { name: '餐饮', icon: '🍽️' },
  { name: '交通', icon: '🚗' },
  { name: '购物', icon: '🛍️' },
  { name: '娱乐', icon: '🎮' },
  { name: '居住', icon: '🏠' },
  { name: '医疗', icon: '🏥' },
  { name: '教育', icon: '📚' },
  { name: '其他', icon: '📝' }
];

export const PERIODS = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
  { value: 'year', label: '年' }
];

export const CURRENCIES = [
  { code: 'CNY', symbol: '¥', name: '人民币' },
  { code: 'USD', symbol: '$', name: '美元' },
  { code: 'EUR', symbol: '€', name: '欧元' },
  { code: 'JPY', symbol: '¥', name: '日元' }
];

export const LANGUAGES = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' }
];

export const CHART_COLORS = [
  '#1890ff', // primary
  '#52c41a', // success
  '#faad14', // warning
  '#f5222d', // error
  '#722ed1', // purple
  '#13c2c2', // cyan
  '#eb2f96', // pink
  '#a0d911'  // lime
];

export const CHART_THEMES = {
  light: {
    backgroundColor: '#ffffff',
    textColor: '#333333',
  },
  dark: {
    backgroundColor: '#141414',
    textColor: '#ffffff',
  }
}; 