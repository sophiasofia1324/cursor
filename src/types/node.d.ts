declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    REACT_APP_FIREBASE_API_KEY: string;
    REACT_APP_FIREBASE_AUTH_DOMAIN: string;
    REACT_APP_FIREBASE_PROJECT_ID: string;
    REACT_APP_FIREBASE_STORAGE_BUCKET: string;
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID: string;
    REACT_APP_FIREBASE_APP_ID: string;
  }

  interface Timer {
    hasRef(): boolean;
    refresh(): Timer;
    [Symbol.toPrimitive](): number;
  }

  interface Timeout extends Timer {
    ref(): Timeout;
    unref(): Timeout;
  }
} 