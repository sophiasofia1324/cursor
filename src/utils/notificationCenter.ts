type NotificationType = 'info' | 'warning' | 'error' | 'success';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
  read: boolean;
}

export class NotificationCenter {
  private static instance: NotificationCenter;
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  static getInstance() {
    if (!NotificationCenter.instance) {
      NotificationCenter.instance = new NotificationCenter();
    }
    return NotificationCenter.instance;
  }

  addNotification(type: NotificationType, message: string) {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      type,
      message,
      timestamp: Date.now(),
      read: false
    };

    this.notifications.set(id, notification);
    this.notifyListeners();
    this.showSystemNotification(notification);
  }

  private async showSystemNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('记账提醒', {
        body: notification.message,
        icon: '/icon.png'
      });
    }
  }

  markAsRead(id: string) {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
      this.notifyListeners();
    }
  }

  getUnreadCount(): number {
    return Array.from(this.notifications.values())
      .filter(n => !n.read).length;
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const notifications = Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp);
    this.listeners.forEach(listener => listener(notifications));
  }

  clearAll() {
    this.notifications.clear();
    this.notifyListeners();
  }
}

export const notificationCenter = NotificationCenter.getInstance(); 