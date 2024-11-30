import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface Notification {
  id?: string;
  userId: string;
  type: 'budget_alert' | 'category_limit' | 'recurring_expense' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'notifications'), {
    ...notification,
    read: false,
    createdAt: Timestamp.now()
  });

  // 显示实时通知
  toast(notification.message, {
    icon: getNotificationIcon(notification.type),
    duration: 5000
  });

  return docRef.id;
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    where('read', '==', false)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt.toDate()
  })) as Notification[];
};

const getNotificationIcon = (type: Notification['type']): string => {
  switch (type) {
    case 'budget_alert':
      return '⚠️';
    case 'category_limit':
      return '🚫';
    case 'recurring_expense':
      return '🔄';
    case 'system':
      return '📢';
    default:
      return '📝';
  }
}; 