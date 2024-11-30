declare module 'firebase/app' {
  export interface FirebaseOptions {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  }

  export function initializeApp(options: FirebaseOptions): any;
}

declare module 'firebase/auth' {
  export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }

  export function getAuth(app?: any): any;
  export function signInWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function createUserWithEmailAndPassword(auth: any, email: string, password: string): Promise<any>;
  export function signOut(auth: any): Promise<void>;
  export function onAuthStateChanged(auth: any, callback: (user: User | null) => void): () => void;
}

declare module 'firebase/firestore' {
  export class Timestamp {
    static now(): Timestamp;
    static fromDate(date: Date): Timestamp;
    static fromMillis(milliseconds: number): Timestamp;
    toDate(): Date;
    toMillis(): number;
  }

  export function getFirestore(app?: any): any;
  export function collection(db: any, path: string): any;
  export function doc(db: any, path: string, ...pathSegments: string[]): any;
  export function getDocs(query: any): Promise<any>;
  export function getDoc(docRef: any): Promise<any>;
  export function setDoc(docRef: any, data: any): Promise<void>;
  export function updateDoc(docRef: any, data: any): Promise<void>;
  export function deleteDoc(docRef: any): Promise<void>;
  export function query(collection: any, ...queryConstraints: any[]): any;
  export function where(field: string, opStr: string, value: any): any;
  export function orderBy(field: string, directionStr?: 'asc' | 'desc'): any;
  export function limit(limit: number): any;
  export function addDoc(collection: any, data: any): Promise<any>;
  export function writeBatch(db: any): any;
}

declare module 'firebase/storage' {
  export function getStorage(app?: any): any;
  export function ref(storage: any, path: string): any;
  export function uploadBytes(ref: any, data: any): Promise<any>;
  export function getDownloadURL(ref: any): Promise<string>;
  export function deleteObject(ref: any): Promise<void>;
  export function listAll(ref: any): Promise<any>;
} 