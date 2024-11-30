import { db } from '../config/firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Expense, Budget, Category } from '../types';
import * as XLSX from 'xlsx';
import { getExpenses } from './expenseService';

interface ExportData {
  expenses: Expense[];
  budgets: Budget[];
  categories: Category[];
  metadata: {
    version: string;
    exportDate: string;
    userId: string;
  };
}

export const exportToExcel = async (userId: string): Promise<string> => {
  const data = await collectUserData(userId);
  const wb = XLSX.utils.book_new();

  // 支出数据表
  const expenseWs = XLSX.utils.json_to_sheet(data.expenses.map(e => ({
    ...e,
    date: new Date(e.date).toLocaleDateString(),
    createdAt: new Date(e.createdAt).toLocaleDateString(),
    updatedAt: new Date(e.updatedAt).toLocaleDateString()
  })));
  XLSX.utils.book_append_sheet(wb, expenseWs, '支出记录');

  // 预算数据表
  const budgetWs = XLSX.utils.json_to_sheet(data.budgets);
  XLSX.utils.book_append_sheet(wb, budgetWs, '预算设置');

  // 类别数据表
  const categoryWs = XLSX.utils.json_to_sheet(data.categories);
  XLSX.utils.book_append_sheet(wb, categoryWs, '支出类别');

  // 生成Excel文件
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // 上传到Firebase Storage
  const storage = getStorage();
  const fileRef = ref(storage, `exports/${userId}/${Date.now()}.xlsx`);
  await uploadBytes(fileRef, blob);

  return getDownloadURL(fileRef);
};

export const importFromExcel = async (userId: string, file: File): Promise<void> => {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer);

  const expenses = XLSX.utils.sheet_to_json(wb.Sheets['支出记录']);
  const budgets = XLSX.utils.sheet_to_json(wb.Sheets['预算设置']);
  const categories = XLSX.utils.sheet_to_json(wb.Sheets['支出类别']);

  const batch = writeBatch(db);

  // 导入支出记录
  expenses.forEach((expense: any) => {
    const expenseRef = doc(collection(db, 'expenses'));
    batch.set(expenseRef, {
      ...expense,
      userId,
      date: new Date(expense.date),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  // 导入预算设置
  budgets.forEach((budget: any) => {
    const budgetRef = doc(collection(db, 'budgets'));
    batch.set(budgetRef, {
      ...budget,
      userId,
      updatedAt: new Date()
    });
  });

  // 导入类别
  categories.forEach((category: any) => {
    const categoryRef = doc(collection(db, 'categories'));
    batch.set(categoryRef, {
      ...category,
      userId
    });
  });

  await batch.commit();
};

const collectUserData = async (userId: string): Promise<ExportData> => {
  const [expenses] = await Promise.all([
    getExpenses(userId, new Date(0), new Date())
  ]);

  return {
    expenses,
    budgets: [],
    categories: [],
    metadata: {
      version: '1.0',
      exportDate: new Date().toISOString(),
      userId
    }
  };
}; 