import { Timeout } from 'node:timers';

interface Reminder {
  id: string;
  userId: string;
  type: 'expense' | 'budget' | 'goal';
  title: string;
  message: string;
  schedule: {
    type: 'once' | 'daily' | 'weekly' | 'monthly';
    time: string;
    days?: number[];
    date?: number;
  };
  enabled: boolean;
  lastTriggered?: Date;
}

export class ReminderManager {
  private static instance: ReminderManager;
  private reminders: Map<string, Reminder> = new Map();
  private timers: Map<string, any> = new Map();

  static getInstance() {
    if (!ReminderManager.instance) {
      ReminderManager.instance = new ReminderManager();
    }
    return ReminderManager.instance;
  }

  addReminder(reminder: Omit<Reminder, 'id'>): string {
    const id = Date.now().toString();
    const newReminder = { ...reminder, id };
    this.reminders.set(id, newReminder);
    this.scheduleReminder(newReminder);
    return id;
  }

  private scheduleReminder(reminder: Reminder) {
    if (!reminder.enabled) return;

    const timer = setInterval(() => {
      if (this.shouldTrigger(reminder)) {
        this.triggerReminder(reminder);
      }
    }, this.calculateInterval(reminder));

    this.timers.set(reminder.id, timer);
  }

  private shouldTrigger(reminder: Reminder): boolean {
    // 实现触发条件检查
    return true;
  }

  private calculateInterval(reminder: Reminder): number {
    // 实现间隔计算
    return 60000; // 默认1分钟
  }

  private async triggerReminder(reminder: Reminder) {
    // 实现提醒触发逻辑
  }

  updateReminder(id: string, updates: Partial<Reminder>) {
    const reminder = this.reminders.get(id);
    if (reminder) {
      const updatedReminder = { ...reminder, ...updates };
      this.reminders.set(id, updatedReminder);
      
      // 重新调度提醒
      this.clearTimer(id);
      this.scheduleReminder(updatedReminder);
    }
  }

  private clearTimer(id: string) {
    const timer = this.timers.get(id);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(id);
    }
  }

  deleteReminder(id: string) {
    this.clearTimer(id);
    this.reminders.delete(id);
  }
}

export const reminderManager = ReminderManager.getInstance(); 