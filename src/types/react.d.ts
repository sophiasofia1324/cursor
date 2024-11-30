import { ReactNode } from 'react';

declare module 'react' {
  export = React;
  export as namespace React;

  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }

  export type ReactNode = 
    | ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactNodeArray;

  export type ReactNodeArray = Array<ReactNode>;

  export class Component<P = {}, S = {}> {
    render(): ReactNode;
    setState(state: S | ((prevState: S) => S)): void;
    forceUpdate(): void;
    props: P;
    state: S;
  }

  export function useRef<T>(initialValue: T | null): MutableRefObject<T | null>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;

  export function useState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>];
  export function useState<T = undefined>(): [T | undefined, Dispatch<SetStateAction<T | undefined>>];

  export interface MutableRefObject<T> {
    current: T;
  }

  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type Dispatch<A> = (value: A) => void;

  export const createContext: <T>(defaultValue: T) => Context<T>;
  export const memo: <P extends object>(Component: FunctionComponent<P>) => FunctionComponent<P>;
  export const forwardRef: <T, P = {}>(render: (props: P, ref: React.Ref<T>) => ReactElement | null) => (props: P & { ref?: React.Ref<T> }) => ReactElement | null;

  export interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: 'submit' | 'reset' | 'button';
    disabled?: boolean;
  }

  export interface FormEvent<T = Element> extends SyntheticEvent<T> {
    preventDefault(): void;
  }

  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: T & {
      value: string;
      checked: boolean;
    };
  }

  export interface ComponentType<P = {}> {
    (props: P): ReactElement<any, any> | null;
  }

  export interface ComponentClass<P = {}, S = {}> extends StaticLifecycle<P, S> {
    new(props: P, context?: any): Component<P, S>;
    propTypes?: WeakValidationMap<P>;
    contextType?: Context<any>;
    contextTypes?: ValidationMap<any>;
    childContextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export interface FunctionComponent<P = {}> {
    (props: PropsWithChildren<P>, context?: any): ReactElement<any, any> | null;
    propTypes?: WeakValidationMap<P>;
    contextTypes?: ValidationMap<any>;
    defaultProps?: Partial<P>;
    displayName?: string;
  }

  export interface ForwardRefRenderFunction<T, P = {}> {
    (props: P, ref: ForwardedRef<T>): ReactElement | null;
    displayName?: string;
    defaultProps?: Partial<P>;
    propTypes?: WeakValidationMap<P>;
  }

  export const forwardRef: <T, P = {}>(render: ForwardRefRenderFunction<T, P>) => ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

  export function useEffect(effect: () => void | (() => void), deps?: ReadonlyArray<any>): void;
  export function useState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>];
  export function useContext<T>(context: Context<T>): T;
  export function useRef<T>(initialValue: T | null): MutableRefObject<T | null>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;
} 