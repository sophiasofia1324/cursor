import React from 'react';
import {
  HomeIcon,
  PlusCircleIcon,
  ChartPieIcon,
  CogIcon,
} from '@heroicons/react/outline';

const navigation = [
  { name: '总览', icon: HomeIcon, href: '/' },
  { name: '记录支出', icon: PlusCircleIcon, href: '/expense/new' },
  { name: '统计分析', icon: ChartPieIcon, href: '/statistics' },
  { name: '设置', icon: CogIcon, href: '/settings' },
];

const Sidebar: React.FC = () => {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white dark:bg-gray-800">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <item.icon
                  className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                />
                {item.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 