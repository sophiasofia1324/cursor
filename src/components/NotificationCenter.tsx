import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getNotifications } from '../services/notificationSystem';
import { BellIcon } from '@heroicons/react/outline';

const NotificationCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      // 每分钟检查一次新通知
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const loadNotifications = async () => {
    if (!currentUser) return;
    const notifs = await getNotifications(currentUser.uid);
    setNotifications(notifs);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <BellIcon className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        )}
      </button>

      {showDropdown && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu">
            {notifications.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                暂无新通知
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 