import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/outline';

const Header: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">个人记账</h1>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
        >
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header; 