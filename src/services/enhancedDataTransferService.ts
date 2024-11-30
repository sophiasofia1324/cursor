import { db, storage } from '../config/firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Expense, Budget, Category, UserPreferences } from '../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportOptions {
  format: 'excel' | 'pdf' | 'json';
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  includeMetadata?: boolean;
  password?: string;
  compress?: boolean;
}

interface ImportOptions {
  format: 'excel' | 'json';
  validateData?: boolean;
  mergeStrategy?: 'replace' | 'merge' | 'skip';
  password?: string;
}

export const enhancedExport = async (
  userId: string,
  options: ExportOptions
): Promise<string> => {
  const data = await collectData(userId, options);
  
  switch (options.format) {
    case 'excel':
      return exportToExcel(data, options);
    case 'pdf':
      return exportToPDF(data, options);
    case 'json':
      return exportToJSON(data, options);
    default:
      throw new Error('不支持的导出格式');
  }
};

export const enhancedImport = async (
  userId: string,
  file: File,
  options: ImportOptions
): Promise<{
  success: boolean;
  message: string;
  importedCount: number;
  errors?: any[];
}> => {
  try {
    let data;
    
    switch (options.format) {
      case 'excel':
        data = await parseExcel(file);
        break;
      case 'json':
        data = await parseJSON(file);
        break;
      default:
        throw new Error('不支持的导入格式');
    }

    if (options.validateData) {
      const validationResult = validateImportData(data);
      if (!validationResult.valid) {
        return {
          success: false,
          message: '数据验证失败',
          importedCount: 0,
          errors: validationResult.errors
        };
      }
    }

    const result = await importData(userId, data, options);
    return {
      success: true,
      message: '导入成功',
      importedCount: result.count,
      errors: result.errors
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      importedCount: 0,
      errors: [error]
    };
  }
};

const collectData = async (
  userId: string,
  options: ExportOptions
): Promise<any> => {
  const queries = [
    getExpenses(userId, options.dateRange?.start, options.dateRange?.end),
    getBudgets(userId),
    getCategories(userId)
  ];

  if (options.includeMetadata) {
    queries.push(getUserPreferences(userId));
  }

  const [expenses, budgets, categories, preferences] = await Promise.all(queries);

  return {
    expenses: filterExpensesByCategories(expenses, options.categories),
    budgets,
    categories,
    ...(preferences && { preferences }),
    metadata: {
      exportDate: new Date().toISOString(),
      userId,
      version: '2.0'
    }
  };
};

const exportToExcel = async (data: any, options: ExportOptions): Promise<string> => {
  const wb = XLSX.utils.book_new();

  // 支出数据表
  const expenseWs = XLSX.utils.json_to_sheet(
    data.expenses.map((e: Expense) => ({
      ...e,
      date: new Date(e.date).toLocaleDateString(),
      createdAt: new Date(e.createdAt).toLocaleDateString(),
      updatedAt: new Date(e.updatedAt).toLocaleDateString()
    }))
  );
  XLSX.utils.book_append_sheet(wb, expenseWs, '支出记录');

  // 预算数据表
  const budgetWs = XLSX.utils.json_to_sheet(data.budgets);
  XLSX.utils.book_append_sheet(wb, budgetWs, '预算设置');

  // 类别数据表
  const categoryWs = XLSX.utils.json_to_sheet(data.categories);
  XLSX.utils.book_append_sheet(wb, categoryWs, '支出类别');

  // 生成Excel文件
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  // 上传到Firebase Storage
  const fileRef = ref(storage, `exports/${data.metadata.userId}/${Date.now()}.xlsx`);
  await uploadBytes(fileRef, blob);

  return getDownloadURL(fileRef);
};

const exportToPDF = async (data: any, options: ExportOptions): Promise<string> => {
  const doc = new jsPDF();
  
  // 添加标题
  doc.setFontSize(20);
  doc.text('支出报告', doc.internal.pageSize.width / 2, 20, { align: 'center' });

  // 添加元数据
  doc.setFontSize(10);
  doc.text(`导出日期: ${new Date().toLocaleDateString()}`, 20, 30);
  doc.text(`时间范围: ${options.dateRange?.start.toLocaleDateString()} - ${options.dateRange?.end.toLocaleDateString()}`, 20, 40);

  // 添加支出汇总
  const totalExpense = data.expenses.reduce((sum: number, e: Expense) => sum + e.amount, 0);
  doc.text(`总支出: ${totalExpense.toFixed(2)}`, 20, 50);

  // 添加支出明细表格
  doc.autoTable({
    startY: 60,
    head: [['日期', '类别', '金额', '备注']],
    body: data.expenses.map((e: Expense) => [
      new Date(e.date).toLocaleDateString(),
      e.category,
      e.amount.toFixed(2),
      e.note || ''
    ])
  });

  // 生成PDF文件
  const pdfBuffer = doc.output('arraybuffer');
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });

  // 上传到Firebase Storage
  const fileRef = ref(storage, `exports/${data.metadata.userId}/${Date.now()}.pdf`);
  await uploadBytes(fileRef, blob);

  return getDownloadURL(fileRef);
};

const exportToJSON = async (data: any, options: ExportOptions): Promise<string> => {
  let jsonContent = JSON.stringify(data, null, 2);
  
  if (options.password) {
    jsonContent = await encryptData(jsonContent, options.password);
  }
  
  if (options.compress) {
    jsonContent = await compressData(jsonContent);
  }

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const fileRef = ref(storage, `exports/${data.metadata.userId}/${Date.now()}.json`);
  await uploadBytes(fileRef, blob);

  return getDownloadURL(fileRef);
};

// ... 其他辅助函数的实现 