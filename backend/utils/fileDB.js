import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DB_DIR, 'database.json');

const initDB = async () => {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      users: [],
      expenses: [],
      incomes: [],
      budgets: [],
      goals: [],
      groups: [],
      invitations: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  }
};

const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return { users: [], expenses: [], incomes: [], budgets: [], goals: [], groups: [], invitations: [] };
  }
};

const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing database:', error);
    return false;
  }
};

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export default {
  initDB,
  getDbFilePath: () => DB_FILE,
  
  // Users
  createUser: (userData) => {
    const db = readDB();
    const user = { _id: generateId(), ...userData, createdAt: new Date().toISOString() };
    db.users.push(user);
    writeDB(db);
    return user;
  },
  
  findUserByEmail: (email) => {
    const db = readDB();
    return db.users.find(u => u.email === email);
  },
  
  findUserById: (id) => {
    const db = readDB();
    return db.users.find(u => u._id === id);
  },
  
  updateUser: (id, updateData) => {
    const db = readDB();
    const index = db.users.findIndex(u => u._id === id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...updateData, updatedAt: new Date().toISOString() };
      writeDB(db);
      return db.users[index];
    }
    return null;
  },
  
  // Expenses
  createExpense: (expenseData) => {
    const db = readDB();
    const expense = { _id: generateId(), ...expenseData, createdAt: new Date().toISOString() };
    db.expenses.push(expense);
    writeDB(db);
    return expense;
  },
  
  findExpenses: (filter = {}) => {
    const db = readDB();
    let expenses = db.expenses;
    if (filter.user) {
      expenses = expenses.filter(e => e.user === filter.user);
    }
    return expenses;
  },
  
  updateExpense: (id, updateData) => {
    const db = readDB();
    const index = db.expenses.findIndex(e => e._id === id);
    if (index !== -1) {
      db.expenses[index] = { ...db.expenses[index], ...updateData, updatedAt: new Date().toISOString() };
      writeDB(db);
      return db.expenses[index];
    }
    return null;
  },
  
  deleteExpense: (id) => {
    const db = readDB();
    db.expenses = db.expenses.filter(e => e._id !== id);
    writeDB(db);
    return true;
  },
  
  // Income
  createIncome: (incomeData) => {
    const db = readDB();
    const income = { _id: generateId(), ...incomeData, createdAt: new Date().toISOString() };
    db.incomes.push(income);
    writeDB(db);
    return income;
  },
  
  findIncomes: (filter = {}) => {
    const db = readDB();
    let incomes = db.incomes;
    if (filter.user) {
      incomes = incomes.filter(i => i.user === filter.user);
    }
    return incomes;
  },
  
  updateIncome: (id, updateData) => {
    const db = readDB();
    const index = db.incomes.findIndex(i => i._id === id);
    if (index !== -1) {
      db.incomes[index] = { ...db.incomes[index], ...updateData, updatedAt: new Date().toISOString() };
      writeDB(db);
      return db.incomes[index];
    }
    return null;
  },
  
  deleteIncome: (id) => {
    const db = readDB();
    db.incomes = db.incomes.filter(i => i._id !== id);
    writeDB(db);
    return true;
  },
  
  // Budgets
  createBudget: (budgetData) => {
    const db = readDB();
    const budget = { _id: generateId(), ...budgetData, createdAt: new Date().toISOString() };
    db.budgets.push(budget);
    writeDB(db);
    return budget;
  },
  
  findBudgets: (filter = {}) => {
    const db = readDB();
    let budgets = db.budgets;
    if (filter.user) {
      budgets = budgets.filter(b => b.user === filter.user);
    }
    return budgets;
  },
  
  // Goals
  createGoal: (goalData) => {
    const db = readDB();
    const goal = { _id: generateId(), currentAmount: 0, ...goalData, createdAt: new Date().toISOString() };
    db.goals.push(goal);
    writeDB(db);
    return goal;
  },
  
  findGoals: (filter = {}) => {
    const db = readDB();
    let goals = db.goals;
    if (filter.user) {
      goals = goals.filter(g => g.user === filter.user);
    }
    return goals;
  },
  
  updateGoal: (id, updateData) => {
    const db = readDB();
    const index = db.goals.findIndex(g => g._id === id);
    if (index !== -1) {
      db.goals[index] = { ...db.goals[index], ...updateData, updatedAt: new Date().toISOString() };
      writeDB(db);
      return db.goals[index];
    }
    return null;
  },
  
  // Groups
  createGroup: (groupData) => {
    const db = readDB();
    const group = { _id: generateId(), members: [], invitations: [], ...groupData, createdAt: new Date().toISOString() };
    db.groups.push(group);
    writeDB(db);
    return group;
  },
  
  findGroups: (filter = {}) => {
    const db = readDB();
    return db.groups.filter(g => !filter.user || g.owner === filter.user || g.members.includes(filter.user));
  },
  
  findAllUsers: () => {
    const db = readDB();
    return db.users;
  }
};

