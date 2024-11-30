import { ReactNode } from 'react';

export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ChartProps extends BaseProps {
  data: any;
  options?: any;
} 