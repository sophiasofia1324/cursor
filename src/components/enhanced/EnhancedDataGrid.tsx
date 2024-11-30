import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  ChevronUpIcon, 
  ChevronDownIcon,
  FilterIcon,
  SortAscendingIcon,
  SortDescendingIcon
} from '@heroicons/react/outline';

interface Column<T> {
  key: keyof T;
  title: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  pagination?: {
    pageSize: number;
    page: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  filters?: {
    [key: string]: any;
  };
  onFilterChange?: (filters: any) => void;
  sortable?: boolean;
  selectable?: boolean;
  loading?: boolean;
  rowKey?: keyof T;
  expandable?: {
    expandedRowRender: (record: T) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
  };
  summary?: (data: T[]) => React.ReactNode;
  footer?: React.ReactNode;
  toolbar?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function EnhancedDataGrid<T extends object>({
  data,
  columns,
  onRowClick,
  onSelectionChange,
  pagination,
  filters,
  onFilterChange,
  sortable = true,
  selectable = false,
  loading = false,
  rowKey = 'id' as keyof T,
  expandable,
  summary,
  footer,
  toolbar,
  className,
  style,
}: Props<T>) {
  const [selectedRows, setSelectedRows] = useState<T[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<any>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, any>>(filters || {});

  // 处理排序
  const handleSort = (key: keyof T) => {
    if (!sortable) return;

    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  // 处理筛选
  const handleFilter = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilterChange?.(newFilters);
  };

  // 处理选择
  const handleSelect = (row: T) => {
    const newSelection = selectedRows.includes(row)
      ? selectedRows.filter(r => r !== row)
      : [...selectedRows, row];
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  // 处理展开
  const handleExpand = (rowKey: any) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowKey)) {
      newExpanded.delete(rowKey);
    } else {
      newExpanded.add(rowKey);
    }
    setExpandedRows(newExpanded);
  };

  // 排序数据
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // 筛选数据
  const filteredData = React.useMemo(() => {
    return sortedData.filter(row => {
      return Object.entries(filterValues).every(([key, value]) => {
        if (!value) return true;
        const cellValue = row[key as keyof T];
        return String(cellValue).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  }, [sortedData, filterValues]);

  // 分页数据
  const paginatedData = React.useMemo(() => {
    if (!pagination) return filteredData;

    const { page, pageSize } = pagination;
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, pagination]);

  return (
    <div className={`overflow-hidden rounded-lg shadow ${className}`} style={style}>
      {toolbar && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length}
                    onChange={() => {
                      const newSelection = selectedRows.length === data.length ? [] : [...data];
                      setSelectedRows(newSelection);
                      onSelectionChange?.(newSelection);
                    }}
                  />
                </TableCell>
              )}
              {expandable && <TableCell width="40px" />}
              {columns.map(column => (
                <TableCell
                  key={String(column.key)}
                  width={column.width}
                  className={`${column.sortable && sortable ? 'cursor-pointer' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.title}</span>
                    {column.sortable && sortable && sortConfig?.key === column.key && (
                      <span>
                        {sortConfig.direction === 'asc' ? (
                          <SortAscendingIcon className="w-4 h-4" />
                        ) : (
                          <SortDescendingIcon className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                  {column.filterable && (
                    <div className="mt-2">
                      <Input
                        size="small"
                        placeholder={`筛选${column.title}`}
                        value={filterValues[column.key as string] || ''}
                        onChange={e => handleFilter(column.key as string, e.target.value)}
                        prefix={<FilterIcon className="w-4 h-4 text-gray-400" />}
                      />
                    </div>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
                  className="text-center py-8"
                >
                  加载中...
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
                  className="text-center py-8"
                >
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <React.Fragment key={String(row[rowKey])}>
                  <TableRow
                    onClick={() => onRowClick?.(row)}
                    className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row)}
                          onChange={() => handleSelect(row)}
                        />
                      </TableCell>
                    )}
                    {expandable && (
                      <TableCell>
                        {(!expandable.rowExpandable || expandable.rowExpandable(row)) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExpand(row[rowKey])}
                          >
                            {expandedRows.has(row[rowKey]) ? (
                              <ChevronUpIcon className="w-4 h-4" />
                            ) : (
                              <ChevronDownIcon className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    )}
                    {columns.map(column => (
                      <TableCell key={String(column.key)}>
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key])}
                      </TableCell>
                    ))}
                  </TableRow>
                  {expandable && expandedRows.has(row[rowKey]) && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (selectable ? 1 : 0) + 1}
                        className="p-0"
                      >
                        {expandable.expandedRowRender(row)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {summary && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {summary(data)}
        </div>
      )}

      {(pagination || footer) && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {pagination && (
            <div className="flex items-center justify-between">
              <div>
                共 {pagination.total} 条记录
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  disabled={pagination.page === 1}
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                >
                  上一页
                </Button>
                <span>
                  第 {pagination.page} 页，共{' '}
                  {Math.ceil(pagination.total / pagination.pageSize)} 页
                </span>
                <Button
                  disabled={
                    pagination.page ===
                    Math.ceil(pagination.total / pagination.pageSize)
                  }
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
          {footer}
        </div>
      )}
    </div>
  );
} 