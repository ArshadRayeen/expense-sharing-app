import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { User, Group, Expense, ExpenseSplit, Settlement } from '../types';

// Define the WebSQLDatabase type that expo-sqlite actually returns
interface WebSQLDatabase {
  transaction: (
    callback: (tx: SQLTransaction) => void,
    error?: (error: Error) => void,
    success?: () => void
  ) => void;
  readTransaction: (
    callback: (tx: SQLTransaction) => void,
    error?: (error: Error) => void,
    success?: () => void
  ) => void;
}

// Define the SQLite transaction type
interface SQLTransaction {
  executeSql: (
    sqlStatement: string,
    args?: any[],
    callback?: (transaction: SQLTransaction, resultSet: SQLResultSet) => void,
    errorCallback?: (transaction: SQLTransaction, error: Error) => boolean
  ) => void;
}

interface SQLResultSet {
  rows: {
    _array: any[];
    length: number;
    item: (index: number) => any;
  };
  insertId?: number;
  rowsAffected: number;
}

class Database {
  private db: SQLite.SQLiteDatabase;
  private initialized: boolean = false;

  constructor() {
    if (Platform.OS === 'web') {
      throw new Error('Web platform is not supported');
    }
    this.db = SQLite.openDatabase('expense_sharing.db');
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initDb();
      this.initialized = true;
    }
  }

  private executeSQL(tx: SQLTransaction, sql: string, params: any[] = []): Promise<SQLResultSet> {
    return new Promise((resolve, reject) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  }

  async initDb(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction(
        (tx) => {
          // Drop existing tables to ensure clean state
          // tx.executeSql('DROP TABLE IF EXISTS expense_splits');
          // tx.executeSql('DROP TABLE IF EXISTS expenses');
          // tx.executeSql('DROP TABLE IF EXISTS friendships');
          // tx.executeSql('DROP TABLE IF EXISTS group_members');
          // tx.executeSql('DROP TABLE IF EXISTS groups');
          // tx.executeSql('DROP TABLE IF EXISTS users');

          // Create tables in order
          console.log('Creating users table...');
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS users (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              email TEXT UNIQUE NOT NULL,
              password_hash TEXT NOT NULL,
              created_at INTEGER NOT NULL
            );
          `);

          console.log('Creating friendships table...');
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS friendships (
              user_id1 TEXT NOT NULL,
              user_id2 TEXT NOT NULL,
              created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
              PRIMARY KEY (user_id1, user_id2),
              FOREIGN KEY (user_id1) REFERENCES users (id) ON DELETE CASCADE,
              FOREIGN KEY (user_id2) REFERENCES users (id) ON DELETE CASCADE
            );
          `);

          console.log('Creating groups table...');
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS groups (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              created_by TEXT NOT NULL,
              created_at INTEGER NOT NULL,
              FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
            );
          `);

          console.log('Creating group_members table...');
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS group_members (
              group_id TEXT NOT NULL,
              user_id TEXT NOT NULL,
              joined_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
              PRIMARY KEY (group_id, user_id),
              FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
              FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );
          `);

          console.log('Creating expenses table...');
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS expenses (
              id TEXT PRIMARY KEY,
              group_id TEXT NOT NULL,
              amount REAL NOT NULL,
              description TEXT NOT NULL,
              payer_id TEXT NOT NULL,
              date TEXT NOT NULL,
              split_type TEXT NOT NULL,
              FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
              FOREIGN KEY (payer_id) REFERENCES users (id) ON DELETE CASCADE
            );
          `);

          console.log('Creating expense_splits table...');
          tx.executeSql(`
            CREATE TABLE IF NOT EXISTS expense_splits (
              expense_id TEXT NOT NULL,
              user_id TEXT NOT NULL,
              amount REAL NOT NULL,
              percentage REAL,
              PRIMARY KEY (expense_id, user_id),
              FOREIGN KEY (expense_id) REFERENCES expenses (id) ON DELETE CASCADE,
              FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );
          `);
        },
        (error) => {
          console.error('Database initialization error:', error);
          reject(error);
        },
        () => {
          console.log('Database initialized successfully');
          this.initialized = true;
          resolve();
        }
      );
    });
  }

  // User operations
  async getUserByEmail(email: string): Promise<User | null> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          'SELECT * FROM users WHERE email = ?',
          [email],
          (_, { rows }) => {
            resolve(rows._array[0] || null);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async addUser(user: User): Promise<void> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          'INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
          [user.id, user.name, user.email, user.password_hash, user.created_at],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Group operations
  async createGroup(data: { name: string; members: string[] }): Promise<Group> {
    const group: Group = {
      id: Date.now().toString(),
      name: data.name,
      members: data.members,
      created_by: data.members[0],
      created_at: Date.now(),
    };

    return new Promise((resolve, reject) => {
      this.db.transaction((tx: SQLTransaction) => {
        // Insert group
        tx.executeSql(
          'INSERT INTO groups (id, name, created_by, created_at) VALUES (?, ?, ?, ?)',
          [group.id, group.name, group.created_by, group.created_at],
          () => {
            // Insert group members
            data.members.forEach(memberId => {
              tx.executeSql(
                'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
                [group.id, memberId]
              );
            });
            resolve(group);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getGroupsByUserId(userId: string): Promise<Group[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          `SELECT g.*, GROUP_CONCAT(gm.user_id) as members
           FROM groups g
           LEFT JOIN group_members gm ON g.id = gm.group_id
           WHERE g.created_by = ? OR gm.user_id = ?
           GROUP BY g.id`,
          [userId, userId],
          (_, { rows }) => {
            const groups = rows._array.map(row => ({
              ...row,
              members: row.members ? row.members.split(',') : []
            }));
            resolve(groups);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Friend operations
  async getFriendsByUserId(userId: string): Promise<User[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          `SELECT DISTINCT u.* 
           FROM users u
           INNER JOIN group_members gm1 ON u.id = gm1.user_id
           INNER JOIN group_members gm2 ON gm1.group_id = gm2.group_id
           WHERE gm2.user_id = ? AND u.id != ?`,
          [userId, userId],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Expense operations
  async createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
    const id = Date.now().toString();
    const newExpense: Expense = { ...expense, id };

    return new Promise((resolve, reject) => {
      this.db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          `INSERT INTO expenses (id, group_id, amount, description, payer_id, date, split_type)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            expense.group_id,
            expense.amount,
            expense.description,
            expense.payer_id,
            expense.date,
            expense.split_type
          ],
          () => resolve(newExpense),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async getExpensesByUserId(userId: string): Promise<Expense[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          `SELECT e.* 
           FROM expenses e
           INNER JOIN expense_splits es ON e.id = es.expense_id
           WHERE e.payer_id = ? OR es.user_id = ?`,
          [userId, userId],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  // Settlement operations
  async getSettlementsByUserId(userId: string): Promise<Settlement[]> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          `SELECT * FROM settlements 
           WHERE payer_id = ? OR payee_id = ?`,
          [userId, userId],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async createSettlement(settlement: Settlement): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          `INSERT INTO settlements (id, payer_id, payee_id, amount, date)
           VALUES (?, ?, ?, ?, ?)`,
          [
            settlement.id,
            settlement.payer_id,
            settlement.payee_id,
            settlement.amount,
            settlement.date,
          ],
          () => resolve(),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async checkFriendship(userId: string, friendId: string): Promise<boolean> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: SQLTransaction) => {
        tx.executeSql(
          `SELECT COUNT(*) as count
           FROM friendships
           WHERE (user_id1 = ? AND user_id2 = ?)
           OR (user_id1 = ? AND user_id2 = ?)`,
          [userId, friendId, friendId, userId],
          (_, { rows }) => {
            resolve(rows._array[0].count > 0);
          },
          (_, error) => {
            console.log('Check Friendship Error:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }

  async addFriendship(userId: string, friendId: string): Promise<void> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.transaction((tx: SQLTransaction) => {
        // Add friendship directly (we already checked existence in the slice)
        tx.executeSql(
          `INSERT INTO friendships (user_id1, user_id2, created_at)
           VALUES (?, ?, ?)`,
          [userId, friendId, Date.now()],
          () => resolve(),
          (_, error) => {
            console.log('Add Friendship Error:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  }
}

export const db = new Database();

// Initialize database
export const initDb = async () => {
  try {
    await db.initDb();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

// Export operations
export const userOperations = {
  getUserByEmail: (email: string) => db.getUserByEmail(email),
  addUser: (user: User) => db.addUser(user),
  checkFriendship: (userId: string, friendId: string) => db.checkFriendship(userId, friendId),
  addFriendship: (userId: string, friendId: string) => db.addFriendship(userId, friendId),
};

export const groupOperations = {
  createGroup: (data: { name: string; members: string[] }) => db.createGroup(data),
  getGroupsByUserId: (userId: string) => db.getGroupsByUserId(userId),
};

export const expenseOperations = {
  createExpense: (expense: Omit<Expense, 'id'>) => db.createExpense(expense),
  getExpensesByUserId: (userId: string) => db.getExpensesByUserId(userId),
};

export const settlementOperations = {
  getSettlementsByUserId: (userId: string) => db.getSettlementsByUserId(userId),
  createSettlement: (settlement: Settlement) => db.createSettlement(settlement),
}; 