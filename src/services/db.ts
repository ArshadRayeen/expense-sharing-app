import * as SQLite from 'expo-sqlite';

interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: number;
}

interface Group {
  id: string;
  name: string;
  created_by: string;
  created_at: number;
}

interface Expense {
  id: string;
  group_id: string;
  paid_by: string;
  amount: number;
  description: string;
  date: number;
  split_type: 'EQUAL' | 'EXACT' | 'PERCENT';
  created_at: number;
}

interface ExpenseShare {
  expense_id: string;
  user_id: string;
  amount: number;
  percentage?: number;
}

interface Settlement {
  id: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  date: number;
  note?: string;
}

// Mock database type
interface MockDatabase {
  transaction: (callback: (tx: any) => void) => void;
}

let db: SQLite.WebSQLDatabase | null = null;

// Export the initDb function
export const initDb = async (): Promise<SQLite.WebSQLDatabase> => {
  if (db) return db;
  
  try {
    // Initialize database
    db = SQLite.openDatabase('expense_sharing.db');
    
    // Create tables
    return new Promise<SQLite.WebSQLDatabase>((resolve, reject) => {
      db!.transaction(tx => {
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at INTEGER
          );
        `, [], 
        () => {
          console.log('Database initialized successfully');
          resolve(db!);
        },
        (_, error) => {
          console.error('Error creating tables:', error);
          reject(error);
          return false;
        });
      });
    });
  } catch (error) {
    console.error('Failed to open database:', error);
    throw error;
  }
};

// Initialize db immediately
initDb().catch(error => {
  console.error('Failed to initialize database:', error);
});

export const initDatabase = async () => {
  try {
    const database = await initDb();
    
    // Create tables if they don't exist
    return new Promise<SQLite.WebSQLDatabase>((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(`
          PRAGMA journal_mode = WAL;
          
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at INTEGER
          );
          
          CREATE TABLE IF NOT EXISTS groups (
            id TEXT PRIMARY KEY,
            name TEXT,
            created_by TEXT,
            created_at INTEGER,
            FOREIGN KEY (created_by) REFERENCES users (id)
          );
          
          CREATE TABLE IF NOT EXISTS group_members (
            group_id TEXT,
            user_id TEXT,
            joined_at INTEGER,
            PRIMARY KEY (group_id, user_id),
            FOREIGN KEY (group_id) REFERENCES groups (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
          );
          
          CREATE TABLE IF NOT EXISTS expenses (
            id TEXT PRIMARY KEY,
            group_id TEXT,
            paid_by TEXT,
            amount REAL,
            description TEXT,
            date INTEGER,
            split_type TEXT,
            created_at INTEGER,
            FOREIGN KEY (group_id) REFERENCES groups (id),
            FOREIGN KEY (paid_by) REFERENCES users (id)
          );
          
          CREATE TABLE IF NOT EXISTS expense_shares (
            expense_id TEXT,
            user_id TEXT,
            amount REAL,
            percentage REAL,
            PRIMARY KEY (expense_id, user_id),
            FOREIGN KEY (expense_id) REFERENCES expenses (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
          );
          
          CREATE TABLE IF NOT EXISTS settlements (
            id TEXT PRIMARY KEY,
            payer_id TEXT,
            payee_id TEXT,
            amount REAL,
            date INTEGER,
            note TEXT,
            FOREIGN KEY (payer_id) REFERENCES users (id),
            FOREIGN KEY (payee_id) REFERENCES users (id)
          );
        `, [], 
        () => resolve(database),
        (_, error) => {
          reject(error);
          return false;
        });
      });
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// User operations
export const userOperations = {
  addUser: async (user: Omit<User, 'created_at'>) => {
    const database = await initDb();
    return new Promise<void>((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          'INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
          [user.id, user.name, user.email, user.password_hash, Date.now()],
          (_, result) => {
            console.log('User added successfully');
            resolve();
          },
          (_, error) => {
            console.error('Error adding user:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  getUserById: async (userId: string): Promise<User | null> => {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users WHERE id = ?',
          [userId],
          (_, result) => {
            resolve(result.rows.length > 0 ? result.rows.item(0) : null);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  getUserByEmail: async (email: string): Promise<User | null> => {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users WHERE email = ?',
          [email],
          (_, result) => {
            if (result.rows.length > 0) {
              resolve(result.rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, error) => {
            console.error('Error getting user:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  getAllUsers: async (): Promise<User[]> => {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM users',
          [],
          (_, result) => {
            const users: User[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              users.push(result.rows.item(i));
            }
            resolve(users);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// Group operations
export const groupOperations = {
  createGroup: async (group: Omit<Group, 'created_at'>) => {
    const database = await initDb();
    await database.runAsync(
      'INSERT INTO groups (id, name, created_by, created_at) VALUES (?, ?, ?, ?)',
      [group.id, group.name, group.created_by, Date.now()]
    );
    
    // Add creator as a member
    await database.runAsync(
      'INSERT INTO group_members (group_id, user_id, joined_at) VALUES (?, ?, ?)',
      [group.id, group.created_by, Date.now()]
    );
  },
  
  getGroupById: async (groupId: string): Promise<Group | null> => {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM groups WHERE id = ?',
          [groupId],
          (_, result) => {
            resolve(result.rows.length > 0 ? result.rows.item(0) : null);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  getGroupsForUser: async (userId: string): Promise<Group[]> => {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          `SELECT g.* FROM groups g
           JOIN group_members gm ON g.id = gm.group_id
           WHERE gm.user_id = ?`,
          [userId],
          (_, result) => {
            const groups: Group[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              groups.push(result.rows.item(i));
            }
            resolve(groups);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  addUserToGroup: async (groupId: string, userId: string) => {
    const database = await initDb();
    await database.runAsync(
      'INSERT INTO group_members (group_id, user_id, joined_at) VALUES (?, ?, ?)',
      [groupId, userId, Date.now()]
    );
  },
  
  getGroupMembers: async (groupId: string): Promise<User[]> => {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          `SELECT u.* FROM users u
           JOIN group_members gm ON u.id = gm.user_id
           WHERE gm.group_id = ?`,
          [groupId],
          (_, result) => {
            const users: User[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              users.push(result.rows.item(i));
            }
            resolve(users);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// Expense operations
export const expenseOperations = {
  addExpense: async (expense: Omit<Expense, 'created_at'>, shares: ExpenseShare[]) => {
    const database = await initDb();
    
    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `INSERT INTO expenses (id, group_id, paid_by, amount, description, date, split_type, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          expense.id,
          expense.group_id,
          expense.paid_by,
          expense.amount,
          expense.description,
          expense.date,
          expense.split_type,
          Date.now()
        ]
      );
      
      for (const share of shares) {
        await database.runAsync(
          `INSERT INTO expense_shares (expense_id, user_id, amount, percentage)
           VALUES (?, ?, ?, ?)`,
          [expense.id, share.user_id, share.amount, share.percentage]
        );
      }
    });
  },
  
  getExpensesForGroup: async (groupId: string): Promise<(Expense & { payer_name: string })[]> => {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          `SELECT e.*, u.name as payer_name
           FROM expenses e
           JOIN users u ON e.paid_by = u.id
           WHERE e.group_id = ?
           ORDER BY e.date DESC`,
          [groupId],
          (_, result) => {
            const expenses: (Expense & { payer_name: string })[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              expenses.push(result.rows.item(i));
            }
            resolve(expenses);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  getExpenseById: async (expenseId: string): Promise<(Expense & { payer_name: string }) | null> => {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          `SELECT e.*, u.name as payer_name
           FROM expenses e
           JOIN users u ON e.paid_by = u.id
           WHERE e.id = ?`,
          [expenseId],
          (_, result) => {
            resolve(result.rows.length > 0 ? result.rows.item(0) : null);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  getExpenseShares: async (expenseId: string): Promise<(ExpenseShare & { user_name: string })[]> => {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          `SELECT es.*, u.name as user_name
           FROM expense_shares es
           JOIN users u ON es.user_id = u.id
           WHERE es.expense_id = ?`,
          [expenseId],
          (_, result) => {
            const shares: (ExpenseShare & { user_name: string })[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              shares.push(result.rows.item(i));
            }
            resolve(shares);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

// Settlement operations
export const settlementOperations = {
  addSettlement: async (settlement: Omit<Settlement, 'date'>) => {
    const database = await initDb();
    await database.runAsync(
      `INSERT INTO settlements (id, payer_id, payee_id, amount, date, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        settlement.id,
        settlement.payer_id,
        settlement.payee_id,
        settlement.amount,
        Date.now(),
        settlement.note
      ]
    );
  },
  
  getSettlementsBetweenUsers: async (
    user1Id: string, 
    user2Id: string
  ): Promise<(Settlement & { payer_name: string; payee_name: string })[]> => {
    const database = await initDb();
    return new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          `SELECT s.*, u1.name as payer_name, u2.name as payee_name
           FROM settlements s
           JOIN users u1 ON s.payer_id = u1.id
           JOIN users u2 ON s.payee_id = u2.id
           WHERE (s.payer_id = ? AND s.payee_id = ?) OR (s.payer_id = ? AND s.payee_id = ?)
           ORDER BY s.date DESC`,
          [user1Id, user2Id, user2Id, user1Id],
          (_, result) => {
            const settlements: (Settlement & { payer_name: string; payee_name: string })[] = [];
            for (let i = 0; i < result.rows.length; i++) {
              settlements.push(result.rows.item(i));
            }
            resolve(settlements);
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  }
};

export default db; 