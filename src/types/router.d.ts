import { ReactNode } from 'react';

// 路由配置
export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  auth?: boolean;
  layout?: React.ComponentType<any>;
  children?: RouteConfig[];
}

// 路由参数
export interface RouteParams {
  id?: string;
  [key: string]: string | undefined;
}

// 路由上下文
export interface RouterContextType {
  location: Location;
  navigate: (to: string, options?: NavigateOptions) => void;
  params: RouteParams;
}

// 导航选项
export interface NavigateOptions {
  replace?: boolean;
  state?: any;
}

// 路由守卫
export interface RouteGuard {
  beforeEnter?: (to: RouteConfig, from: RouteConfig) => boolean | Promise<boolean>;
  afterEnter?: (to: RouteConfig) => void;
  beforeLeave?: (from: RouteConfig) => boolean | Promise<boolean>;
} 