import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, prefix, suffix, size = 'medium', ...props }, ref) => {
    const sizeClasses = {
      small: 'px-2 py-1 text-sm',
      medium: 'px-3 py-2',
      large: 'px-4 py-3 text-lg'
    }[size];

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block w-full rounded-md border-gray-300 dark:border-gray-600
              focus:ring-indigo-500 focus:border-indigo-500
              dark:bg-gray-700 dark:text-white
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${prefix ? 'pl-10' : ''} 
              ${suffix ? 'pr-10' : ''}
              ${sizeClasses}
              ${error ? 'border-red-300 text-red-900 placeholder-red-300' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {suffix}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input'; 