declare namespace JSX {
  interface IntrinsicElements {
    // HTML 元素
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement> & EventHandlers<HTMLInputElement>, HTMLInputElement>;
    select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement> & EventHandlers<HTMLSelectElement>, HTMLSelectElement>;
    option: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
    textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement> & EventHandlers<HTMLTextAreaElement>, HTMLTextAreaElement>;
    form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    
    // 布局元素
    header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    footer: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    nav: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    
    // 标题元素
    h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h5: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h6: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;

    // SVG 元素
    svg: React.SVGProps<SVGSVGElement>;
    path: React.SVGProps<SVGPathElement>;
    circle: React.SVGProps<SVGCircleElement>;
    rect: React.SVGProps<SVGRectElement>;
    line: React.SVGProps<SVGLineElement>;
  }

  interface EventHandler<E extends Event> {
    (event: E): void;
  }

  interface ChangeEventHandler<T = Element> {
    (event: React.ChangeEvent<T>): void;
  }

  interface FormEventHandler<T = Element> {
    (event: React.FormEvent<T>): void;
  }

  interface MouseEventHandler<T = Element> {
    (event: React.MouseEvent<T>): void;
  }

  interface KeyboardEventHandler<T = Element> {
    (event: React.KeyboardEvent<T>): void;
  }

  interface TouchEventHandler<T = Element> {
    (event: React.TouchEvent<T>): void;
  }

  // 更新事件处理器类型
  interface EventHandlers<T = Element> {
    onChange?: (event: React.ChangeEvent<T>) => void;
    onSubmit?: (event: React.FormEvent<T>) => void;
    onClick?: (event: React.MouseEvent<T>) => void;
    onKeyDown?: (event: React.KeyboardEvent<T>) => void;
    onFocus?: (event: React.FocusEvent<T>) => void;
    onBlur?: (event: React.FocusEvent<T>) => void;
    onInput?: (event: React.FormEvent<T>) => void;
    onKeyPress?: (event: React.KeyboardEvent<T>) => void;
    onKeyUp?: (event: React.KeyboardEvent<T>) => void;
  }

  // 更新表单元素类型
  interface FormElements {
    input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement> & EventHandlers<HTMLInputElement>, HTMLInputElement>;
    select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement> & EventHandlers<HTMLSelectElement>, HTMLSelectElement>;
    textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement> & EventHandlers<HTMLTextAreaElement>, HTMLTextAreaElement>;
  }

  interface IntrinsicElements extends FormElements {
    // ... 保持其他元素定义不变
  }

  // 添加事件处理器泛型类型
  interface ChangeEventHandler<T = Element> {
    (event: React.ChangeEvent<T>): void;
  }

  interface FormEventHandler<T = Element> {
    (event: React.FormEvent<T>): void;
  }

  interface MouseEventHandler<T = Element> {
    (event: React.MouseEvent<T>): void;
  }

  // 添加事件对象类型
  interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: T & {
      value: string;
      checked: boolean;
      type: string;
    };
  }

  interface FormEvent<T = Element> extends SyntheticEvent<T> {
    preventDefault(): void;
  }
}

// 扩展 React 命名空间
declare namespace React {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    className?: string;
    style?: CSSProperties;
  }

  interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    className?: string;
    style?: CSSProperties;
    xmlns?: string;
    fill?: string;
    viewBox?: string;
    cx?: string | number;
    cy?: string | number;
    r?: string | number;
    stroke?: string;
    strokeWidth?: string | number;
    d?: string;
  }

  interface DOMAttributes<T> {
    children?: ReactNode;
    dangerouslySetInnerHTML?: {
      __html: string;
    };
    onClick?: (event: MouseEvent<T>) => void;
    onSubmit?: (event: FormEvent<T>) => void;
    onChange?: (event: ChangeEvent<T>) => void;
  }

  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    type?: string;
    value?: string | number | readonly string[];
    defaultValue?: string | number | readonly string[];
    placeholder?: string;
    onChange?: ChangeEventHandler<T>;
  }

  interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | number | readonly string[];
    defaultValue?: string | number | readonly string[];
    onChange?: ChangeEventHandler<T>;
  }

  interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
    value?: string | number | readonly string[];
    defaultValue?: string | number | readonly string[];
    placeholder?: string;
    onChange?: ChangeEventHandler<T>;
    rows?: number;
  }
} 