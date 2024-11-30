import { Expense } from '../types';

export const parseCSV = (csvContent: string): Partial<Expense>[] => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      date: new Date(values[0]),
      type: values[1] as 'expense' | 'income',
      amount: Number(values[2]),
      category: values[3],
      note: values[4]?.replace(/^"|"$/g, '') // 移除引号
    };
  }).filter(expense => !isNaN(expense.amount));
};

export const parseJSON = (jsonContent: string): Partial<Expense>[] => {
  try {
    const data = JSON.parse(jsonContent);
    return Array.isArray(data) ? data.map(item => ({
      ...item,
      date: new Date(item.date)
    })) : [];
  } catch (error) {
    console.error('JSON parsing error:', error);
    return [];
  }
};

export const validateImportData = (data: Partial<Expense>[]): string[] => {
  const errors: string[] = [];
  
  data.forEach((item, index) => {
    if (!item.date || isNaN(item.date.getTime())) {
      errors.push(`第 ${index + 1} 行: 日期无效`);
    }
    if (!item.amount || isNaN(item.amount)) {
      errors.push(`第 ${index + 1} 行: 金额无效`);
    }
    if (!item.type || !['expense', 'income'].includes(item.type)) {
      errors.push(`第 ${index + 1} 行: 类型无效`);
    }
    if (!item.category) {
      errors.push(`第 ${index + 1} 行: 类别不能为空`);
    }
  });

  return errors;
}; 