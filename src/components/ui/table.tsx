import React from 'react';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ children, className, ...props }) => (
  <table className={`min-w-full divide-y divide-gray-200 ${className}`} {...props}>
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className,
  ...props
}) => (
  <thead className={`bg-gray-50 dark:bg-gray-700 ${className}`} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className,
  ...props
}) => (
  <tbody
    className={`bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 ${className}`}
    {...props}
  >
    {children}
  </tbody>
);

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children?: React.ReactNode;
  padding?: 'normal' | 'checkbox' | 'none';
  width?: string;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
  padding = 'normal',
  width,
  ...props
}) => {
  const paddingClass = {
    normal: 'px-6 py-4',
    checkbox: 'pl-4 pr-2 py-4',
    none: ''
  }[padding];

  return (
    <td
      className={`whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${paddingClass} ${className}`}
      style={{ width }}
      {...props}
    >
      {children}
    </td>
  );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className,
  ...props
}) => (
  <tr
    className={`${className} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
    {...props}
  >
    {children}
  </tr>
); 