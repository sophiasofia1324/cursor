/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'react' {
  export = React;
  export as namespace React;
}

declare module 'react/jsx-runtime' {
  export default {} as any;
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | null): {
    render(element: React.ReactNode): void;
    unmount(): void;
  };
}

declare module '@heroicons/react/*' {
  const content: any;
  export default content;
}

declare module 'react-hot-toast' {
  interface Toast {
    success(message: string): void;
    error(message: string): void;
    loading(message: string): void;
    dismiss(): void;
  }

  const toast: Toast & ((message: string) => void);
  export { toast };
}

declare namespace React {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    styleName?: string;
  }

  interface SVGProps<T> extends SVGAttributes<T> {
    styleName?: string;
    className?: string;
  }

  interface FunctionComponent<P = {}> {
    (props: PropsWithChildren<P>, context?: any): ReactElement<any, any> | null;
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  interface FC<P = {}> extends FunctionComponent<P> {}

  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: T & {
      value: string;
      checked: boolean;
    };
  }
} 