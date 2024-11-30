import React from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ChartErrorBoundary extends React.Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    toast.error(`图表加载失败: ${error.message}`);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>图表加载失败</div>;
    }

    return this.props.children;
  }
} 