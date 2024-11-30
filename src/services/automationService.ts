import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getExpenses } from './expenseService';
import { getBudgetRules } from './advancedBudgetService';
import { createNotification } from './notificationSystem';
import { formatCurrency } from '../utils/helpers';

interface AutomationTask {
  id?: string;
  userId: string;
  type: 'expense_alert' | 'budget_reminder' | 'recurring_expense' | 'report_generation';
  name: string;
  enabled: boolean;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  conditions: {
    category?: string;
    amount?: number;
    period?: string;
    threshold?: number;
  };
  actions: {
    type: 'notification' | 'email' | 'create_expense' | 'generate_report';
    data?: any;
  }[];
  lastRun?: Date;
  nextRun: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const createAutomationTask = async (task: Omit<AutomationTask, 'id' | 'createdAt' | 'updatedAt' | 'nextRun'>): Promise<string> => {
  const nextRun = calculateNextRun(task.schedule);
  const docRef = await addDoc(collection(db, 'automationTasks'), {
    ...task,
    nextRun,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return docRef.id;
};

export const getAutomationTasks = async (userId: string): Promise<AutomationTask[]> => {
  const q = query(
    collection(db, 'automationTasks'),
    where('userId', '==', userId),
    where('enabled', '==', true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as AutomationTask));
};

export const executeAutomationTasks = async (userId: string): Promise<void> => {
  const tasks = await getAutomationTasks(userId);
  const now = new Date();

  for (const task of tasks) {
    if (task.nextRun <= now) {
      try {
        await executeTask(task);
        await updateTaskNextRun(task);
      } catch (error) {
        console.error(`Error executing task ${task.id}:`, error);
        await createNotification({
          userId,
          type: 'system',
          title: '自动化任务执行失败',
          message: `任务 "${task.name}" 执行失败，请检查设置。`
        });
      }
    }
  }
};

const executeTask = async (task: AutomationTask): Promise<void> => {
  switch (task.type) {
    case 'expense_alert':
      await handleExpenseAlert(task);
      break;
    case 'budget_reminder':
      await handleBudgetReminder(task);
      break;
    case 'recurring_expense':
      await handleRecurringExpense(task);
      break;
    case 'report_generation':
      await handleReportGeneration(task);
      break;
  }
};

const handleExpenseAlert = async (task: AutomationTask): Promise<void> => {
  const { userId, conditions } = task;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 1); // 检查最近24小时
  
  const expenses = await getExpenses(userId, startDate, new Date());
  const largeExpenses = expenses.filter(e => e.amount >= (conditions.amount || 0));

  if (largeExpenses.length > 0) {
    await createNotification({
      userId,
      type: 'expense_alert',
      title: '大额支出提醒',
      message: `您有${largeExpenses.length}笔大额支出超过${formatCurrency(conditions.amount || 0)}`
    });
  }
};

const handleBudgetReminder = async (task: AutomationTask): Promise<void> => {
  const { userId, conditions } = task;
  const rules = await getBudgetRules(userId);
  const startDate = new Date();
  startDate.setDate(1); // 本月初
  
  const expenses = await getExpenses(userId, startDate, new Date());
  
  for (const rule of rules) {
    const categoryExpenses = expenses
      .filter(e => e.category === rule.category)
      .reduce((sum, e) => sum + e.amount, 0);
    
    const percentage = (categoryExpenses / rule.amount) * 100;
    if (percentage >= (conditions.threshold || 80)) {
      await createNotification({
        userId,
        type: 'budget_alert',
        title: '预算提醒',
        message: `${rule.category}类别已使用${percentage.toFixed(1)}%的预算`
      });
    }
  }
};

const handleRecurringExpense = async (task: AutomationTask): Promise<void> => {
  const { userId, actions } = task;
  
  for (const action of actions) {
    if (action.type === 'create_expense' && action.data) {
      await addDoc(collection(db, 'expenses'), {
        ...action.data,
        userId,
        date: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  }
};

const handleReportGeneration = async (task: AutomationTask): Promise<void> => {
  const { userId, conditions } = task;
  // 实现报表生成逻辑
  // TODO: 实现报表生成
};

const updateTaskNextRun = async (task: AutomationTask): Promise<void> => {
  const taskRef = doc(db, 'automationTasks', task.id!);
  const nextRun = calculateNextRun(task.schedule);
  
  await updateDoc(taskRef, {
    lastRun: new Date(),
    nextRun,
    updatedAt: new Date()
  });
};

const calculateNextRun = (schedule: AutomationTask['schedule']): Date => {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(':').map(Number);
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  switch (schedule.frequency) {
    case 'weekly':
      if (schedule.dayOfWeek !== undefined) {
        const daysUntilNext = (schedule.dayOfWeek - next.getDay() + 7) % 7;
        next.setDate(next.getDate() + daysUntilNext);
      }
      break;
    case 'monthly':
      if (schedule.dayOfMonth !== undefined) {
        next.setDate(schedule.dayOfMonth);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
        }
      }
      break;
  }

  return next;
}; 