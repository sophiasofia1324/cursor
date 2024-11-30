import { db, storage } from '../config/firebase';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { Expense, Budget, Category, UserPreferences } from '../types';
import { encrypt, decrypt } from '../utils/encryption';

interface BackupMetadata {
  version: string;
  timestamp: number;
  userId: string;
  type: 'auto' | 'manual';
  encrypted: boolean;
  size: number;
  checksum: string;
  dataTypes: string[];
}

interface BackupData {
  expenses: Expense[];
  budgets: Budget[];
  categories: Category[];
  preferences: UserPreferences;
  metadata: BackupMetadata;
}

export const createBackup = async (
  userId: string,
  options: {
    encrypt?: boolean;
    type?: 'auto' | 'manual';
    compress?: boolean;
  } = {}
): Promise<string> => {
  const data = await collectBackupData(userId);
  const metadata: BackupMetadata = {
    version: '2.0',
    timestamp: Date.now(),
    userId,
    type: options.type || 'manual',
    encrypted: options.encrypt || false,
    size: 0,
    checksum: '',
    dataTypes: ['expenses', 'budgets', 'categories', 'preferences']
  };

  let backupContent = JSON.stringify({ ...data, metadata });
  
  if (options.encrypt) {
    backupContent = await encrypt(backupContent);
  }

  if (options.compress) {
    backupContent = await compressData(backupContent);
  }

  const blob = new Blob([backupContent], { type: 'application/json' });
  metadata.size = blob.size;
  metadata.checksum = await calculateChecksum(blob);

  const backupRef = ref(storage, `backups/${userId}/${metadata.timestamp}.json`);
  await uploadBytes(backupRef, blob);

  // 保存备份记录
  await saveBackupRecord(userId, metadata);

  return getDownloadURL(backupRef);
};

export const restoreFromBackup = async (
  userId: string,
  backupUrl: string,
  options: {
    validateChecksum?: boolean;
    decryptionKey?: string;
  } = {}
): Promise<void> => {
  const response = await fetch(backupUrl);
  let content = await response.text();

  const metadata = JSON.parse(content).metadata as BackupMetadata;
  
  if (metadata.encrypted && !options.decryptionKey) {
    throw new Error('需要解密密钥');
  }

  if (metadata.encrypted) {
    content = await decrypt(content, options.decryptionKey!);
  }

  if (options.validateChecksum) {
    const checksum = await calculateChecksum(new Blob([content]));
    if (checksum !== metadata.checksum) {
      throw new Error('备份文件校验失败');
    }
  }

  const data = JSON.parse(content) as BackupData;
  await restoreData(userId, data);
};

export const getBackupHistory = async (userId: string): Promise<BackupMetadata[]> => {
  const q = query(
    collection(db, 'backupRecords'),
    where('userId', '==', userId),
    where('status', '==', 'completed')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as BackupMetadata);
};

export const scheduleBackup = async (
  userId: string,
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    encrypt?: boolean;
    compress?: boolean;
    retentionDays: number;
  }
): Promise<void> => {
  await setDoc(doc(db, 'backupSchedules', userId), {
    ...schedule,
    userId,
    enabled: true,
    lastRun: null,
    nextRun: calculateNextRun(schedule),
    updatedAt: new Date()
  });
};

export const cleanupOldBackups = async (
  userId: string,
  retentionDays: number
): Promise<void> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

  const backupsRef = ref(storage, `backups/${userId}`);
  const backups = await listAll(backupsRef);

  for (const backup of backups.items) {
    const metadata = await getMetadata(backup);
    if (new Date(metadata.timeCreated) < cutoffDate) {
      await deleteObject(backup);
    }
  }
};

const collectBackupData = async (userId: string): Promise<Omit<BackupData, 'metadata'>> => {
  const [expenses, budgets, categories, preferences] = await Promise.all([
    getExpenses(userId),
    getBudgets(userId),
    getCategories(userId),
    getUserPreferences(userId)
  ]);

  return {
    expenses,
    budgets,
    categories,
    preferences
  };
};

const restoreData = async (userId: string, data: BackupData): Promise<void> => {
  const batch = writeBatch(db);

  // 恢复支出记录
  data.expenses.forEach(expense => {
    const expenseRef = doc(collection(db, 'expenses'));
    batch.set(expenseRef, {
      ...expense,
      userId,
      updatedAt: new Date()
    });
  });

  // 恢复预算设置
  data.budgets.forEach(budget => {
    const budgetRef = doc(collection(db, 'budgets'));
    batch.set(budgetRef, {
      ...budget,
      userId,
      updatedAt: new Date()
    });
  });

  // 恢复类别
  data.categories.forEach(category => {
    const categoryRef = doc(collection(db, 'categories'));
    batch.set(categoryRef, {
      ...category,
      userId
    });
  });

  // 恢复用户设置
  const preferencesRef = doc(db, 'userPreferences', userId);
  batch.set(preferencesRef, {
    ...data.preferences,
    updatedAt: new Date()
  });

  await batch.commit();
};

const saveBackupRecord = async (userId: string, metadata: BackupMetadata): Promise<void> => {
  await addDoc(collection(db, 'backupRecords'), {
    ...metadata,
    status: 'completed',
    createdAt: new Date()
  });
};

const calculateNextRun = (schedule: { frequency: string; time: string }): Date => {
  const [hours, minutes] = schedule.time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  switch (schedule.frequency) {
    case 'weekly':
      next.setDate(next.getDate() + (7 - next.getDay()));
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      break;
  }

  return next;
};

const calculateChecksum = async (blob: Blob): Promise<string> => {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const compressData = async (data: string): Promise<string> => {
  // 使用 CompressionStream API 压缩数据
  const blob = new Blob([data]);
  const compressedStream = blob.stream().pipeThrough(new CompressionStream('gzip'));
  return new Response(compressedStream).text();
}; 