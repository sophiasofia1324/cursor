declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: { orientation?: string; unit?: string; format?: string });
    text(text: string, x: number, y: number): this;
    addPage(): this;
    save(filename: string): void;
  }
}

declare module 'node:timers' {
  export interface Timeout {
    hasRef(): boolean;
    ref(): this;
    refresh(): this;
    unref(): this;
  }
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

declare module '@heroicons/react/*' {
  const Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  export default Icon;
}

declare module 'react-router-dom' {
  export interface RouteProps {
    path: string;
    element: React.ReactNode;
  }

  export function useNavigate(): (path: string, options?: { replace?: boolean }) => void;
  export function useLocation(): Location;
  export function useParams<T extends Record<string, string>>(): T;
  export function Link(props: { to: string; children: React.ReactNode }): JSX.Element;
  export function Route(props: RouteProps): JSX.Element;
  export function Routes(props: { children: React.ReactNode }): JSX.Element;
  export function BrowserRouter(props: { children: React.ReactNode }): JSX.Element;
}

declare module 'xlsx' {
  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [key: string]: WorkSheet };
  }

  export interface WorkSheet {
    [key: string]: any;
  }

  export function read(data: ArrayBuffer, opts?: any): WorkBook;
  export function write(wb: WorkBook, opts?: any): any;
  export function writeFile(wb: WorkBook, filename: string, opts?: any): void;
}

declare module 'firebase/firestore' {
  export interface Timestamp {
    static now(): Timestamp;
    static fromDate(date: Date): Timestamp;
    static fromMillis(milliseconds: number): Timestamp;
    toDate(): Date;
    toMillis(): number;
  }

  export function collection(firestore: any, path: string): any;
  export function doc(reference: any, ...pathSegments: string[]): any;
  export function getDoc(reference: any): Promise<any>;
  export function getDocs(query: any): Promise<any>;
  export function setDoc(reference: any, data: any): Promise<void>;
  export function updateDoc(reference: any, data: any): Promise<void>;
  export function deleteDoc(reference: any): Promise<void>;
  export function query(reference: any, ...queryConstraints: any[]): any;
  export function where(field: string, opStr: string, value: any): any;
  export function orderBy(field: string, directionStr?: 'asc' | 'desc'): any;
  export function limit(limit: number): any;

  export interface FirestoreDataConverter<T> {
    toFirestore(modelObject: T): DocumentData;
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T;
  }

  export interface QuerySnapshot<T = DocumentData> {
    docs: QueryDocumentSnapshot<T>[];
    empty: boolean;
    size: number;
    forEach(callback: (result: QueryDocumentSnapshot<T>) => void): void;
  }

  export interface DocumentSnapshot<T = DocumentData> {
    id: string;
    exists(): boolean;
    data(options?: SnapshotOptions): T | undefined;
    get(fieldPath: string | FieldPath): any;
  }

  export interface DocumentData {
    [field: string]: any;
  }

  export interface QueryDocumentSnapshot<T = DocumentData> extends DocumentSnapshot<T> {
    data(options?: SnapshotOptions): T;
  }

  export interface SnapshotOptions {
    serverTimestamps?: 'estimate' | 'previous' | 'none';
  }

  export interface FieldPath {
    isEqual(other: FieldPath): boolean;
  }
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }

  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export function onAuthStateChanged(auth: any, callback: (user: User | null) => void): () => void;
}

declare module 'firebase/storage' {
  export function ref(storage: any, path: string): any;
  export function uploadBytes(reference: any, data: Blob | Uint8Array | ArrayBuffer): Promise<any>;
  export function getDownloadURL(reference: any): Promise<string>;
  export function deleteObject(reference: any): Promise<void>;
  export function listAll(reference: any): Promise<{ items: any[]; prefixes: any[] }>;
} 