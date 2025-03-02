declare module 'expo-sqlite' {
  export interface WebSQLDatabase {
    transaction: (callback: (tx: any) => void) => void;
    runAsync: (query: string, params?: any[]) => Promise<any>;
    getFirstAsync: <T>(query: string, params?: any[]) => Promise<T | null>;
    getAllAsync: <T>(query: string, params?: any[]) => Promise<T[]>;
    execAsync: (query: string) => Promise<void>;
    withTransactionAsync: (callback: () => Promise<void>) => Promise<void>;
  }

  export function openDatabaseAsync(name: string): Promise<WebSQLDatabase>;
} 