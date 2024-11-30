import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { CURRENCIES, LANGUAGES } from '../constants';

const UserProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState({
    displayName: '',
    currency: 'CNY',
    language: 'zh'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;
      try {
        const userProfile = await getUserProfile(currentUser.uid);
        if (userProfile) {
          setProfile({
            displayName: userProfile.displayName || '',
            currency: userProfile.preferences.currency,
            language: userProfile.preferences.language
          });
        }
      } catch (error) {
        console.error('加载用户资料失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      await updateUserProfile(currentUser.uid, {
        displayName: profile.displayName,
        preferences: {
          currency: profile.currency,
          language: profile.language,
          theme: 'light' // 这里应该使用实际的主题值
        }
      });
      toast.success('资料更新成功');
    } catch (error) {
      toast.error('更新失败，请重试');
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          显示名称
        </label>
        <input
          type="text"
          value={profile.displayName}
          onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          货币
        </label>
        <select
          value={profile.currency}
          onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {CURRENCIES.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.name} ({currency.symbol})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          语言
        </label>
        <select
          value={profile.language}
          onChange={(e) => setProfile({ ...profile, language: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        保存更改
      </button>
    </form>
  );
};

export default UserProfile; 