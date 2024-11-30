import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

interface UserPreferences {
  theme: 'light' | 'dark';
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    budgetAlerts: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  };
  display: {
    defaultView: 'list' | 'calendar' | 'statistics';
    defaultPeriod: 'day' | 'week' | 'month' | 'year';
    showTags: boolean;
    compactView: boolean;
  };
  categories: {
    custom: string[];
    hidden: string[];
    order: string[];
  };
  security: {
    requireAuth: boolean;
    autoLogout: number; // minutes
    backupFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  };
  shortcuts: {
    [key: string]: {
      type: 'expense' | 'income';
      amount: number;
      category: string;
      note?: string;
    };
  };
}

export const getUserPreferences = async (userId: string): Promise<UserPreferences> => {
  const userRef = doc(db, 'userPreferences', userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    // 返回默认设置
    return {
      theme: 'light',
      currency: 'CNY',
      language: 'zh',
      notifications: {
        email: true,
        push: true,
        budgetAlerts: true,
        weeklyReport: true,
        monthlyReport: true
      },
      display: {
        defaultView: 'list',
        defaultPeriod: 'month',
        showTags: true,
        compactView: false
      },
      categories: {
        custom: [],
        hidden: [],
        order: []
      },
      security: {
        requireAuth: true,
        autoLogout: 30,
        backupFrequency: 'weekly'
      },
      shortcuts: {}
    };
  }

  return snapshot.data() as UserPreferences;
};

export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> => {
  const userRef = doc(db, 'userPreferences', userId);
  await updateDoc(userRef, {
    ...preferences,
    updatedAt: new Date()
  });
};

export const addCustomCategory = async (
  userId: string,
  category: string
): Promise<void> => {
  const userRef = doc(db, 'userPreferences', userId);
  const prefs = await getUserPreferences(userId);

  if (!prefs.categories.custom.includes(category)) {
    await updateDoc(userRef, {
      'categories.custom': [...prefs.categories.custom, category],
      'categories.order': [...prefs.categories.order, category]
    });
  }
};

export const updateCategoryOrder = async (
  userId: string,
  order: string[]
): Promise<void> => {
  const userRef = doc(db, 'userPreferences', userId);
  await updateDoc(userRef, {
    'categories.order': order
  });
};

export const toggleCategoryVisibility = async (
  userId: string,
  category: string,
  hidden: boolean
): Promise<void> => {
  const userRef = doc(db, 'userPreferences', userId);
  const prefs = await getUserPreferences(userId);

  const hiddenCategories = new Set(prefs.categories.hidden);
  if (hidden) {
    hiddenCategories.add(category);
  } else {
    hiddenCategories.delete(category);
  }

  await updateDoc(userRef, {
    'categories.hidden': Array.from(hiddenCategories)
  });
};

export const addShortcut = async (
  userId: string,
  name: string,
  shortcut: UserPreferences['shortcuts'][string]
): Promise<void> => {
  const userRef = doc(db, 'userPreferences', userId);
  const prefs = await getUserPreferences(userId);

  await updateDoc(userRef, {
    shortcuts: {
      ...prefs.shortcuts,
      [name]: shortcut
    }
  });
};

export const removeShortcut = async (
  userId: string,
  name: string
): Promise<void> => {
  const userRef = doc(db, 'userPreferences', userId);
  const prefs = await getUserPreferences(userId);

  const { [name]: removed, ...remainingShortcuts } = prefs.shortcuts;
  await updateDoc(userRef, {
    shortcuts: remainingShortcuts
  });
};

export const updateSecuritySettings = async (
  userId: string,
  settings: Partial<UserPreferences['security']>
): Promise<void> => {
  const userRef = doc(db, 'userPreferences', userId);
  await updateDoc(userRef, {
    security: settings
  });
};

export const updateNotificationSettings = async (
  userId: string,
  settings: Partial<UserPreferences['notifications']>
): Promise<void> => {
  const userRef = doc(db, 'userPreferences', userId);
  await updateDoc(userRef, {
    notifications: settings
  });
}; 