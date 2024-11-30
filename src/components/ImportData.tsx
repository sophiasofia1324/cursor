import React, { useState, useRef } from 'react';
import { parseCSV, parseJSON, validateImportData } from '../utils/importData';
import { Expense } from '../types';
import { addExpense } from '../services/expenseService';
import { useAuth } from '../contexts/AuthContext';

interface ImportDataProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

const ImportData: React.FC<ImportDataProps> = ({ onSuccess, onError }) => {
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    setImporting(true);
    try {
      const content = await file.text();
      const data = file.name.endsWith('.csv') 
        ? parseCSV(content)
        : parseJSON(content);

      const errors = validateImportData(data);
      if (errors.length > 0) {
        onError(`导入数据验证失败:\n${errors.join('\n')}`);
        return;
      }

      // 批量添加数据
      await Promise.all(data.map(expense => 
        addExpense({
          ...expense as Omit<Expense, 'id'>,
          userId: currentUser.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ));

      onSuccess();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      onError('导入数据失败，请检查文件格式是否正确');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json"
        onChange={handleFileUpload}
        disabled={importing}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
      />
      {importing && (
        <div className="text-sm text-gray-500">
          正在导入数据，请稍候...
        </div>
      )}
    </div>
  );
};

export default ImportData; 