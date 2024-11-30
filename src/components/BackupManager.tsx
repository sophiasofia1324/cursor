import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createBackup, restoreBackup, listBackups } from '../services/backupService';
import { formatDate } from '../utils/helpers';

const BackupManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [backups, setBackups] = useState<{ url: string; timestamp: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadBackups();
  }, [currentUser]);

  const loadBackups = async () => {
    if (!currentUser) return;
    try {
      const backupsList = await listBackups(currentUser.uid);
      setBackups(backupsList);
    } catch (error) {
      console.error('Error loading backups:', error);
      toast.error('加载备份列表失败');
    }
  };

  const handleCreateBackup = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await createBackup(currentUser.uid);
      toast.success('备份创建成功');
      await loadBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      // 需要导入 toast 组件
      alert('创建备份失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (backupUrl: string) => {
    if (!currentUser || !confirm('确定要恢复此备份吗？这将覆盖当前数据。')) return;
    setRestoring(true);
    try {
      await restoreBackup(currentUser.uid, backupUrl);
      toast.success('备份恢复成功');
      window.location.reload(); // 刷新页面以加载新数据
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('恢复备份失败');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          数据备份
        </h2>
        <button
          onClick={handleCreateBackup}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? '创建备份中...' : '创建新备份'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {backups.map(backup => (
            <li key={backup.timestamp}>
              <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLin="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      备份 - {formatDate(new Date(backup.timestamp))}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRestoreBackup(backup.url)}
                    disabled={restoring}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {restoring ? '恢复中...' : '恢复'}
                  </button>
                  <a
                    href={backup.url}
                    download={`backup-${backup.timestamp}.json`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    下载
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BackupManager; 