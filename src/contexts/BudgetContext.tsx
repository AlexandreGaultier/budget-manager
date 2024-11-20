import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Transaction, Category, MonthlyBudget } from '../types';
import { defaultCategories } from '../data/defaultCategories';

interface BudgetContextType {
  transactions: Transaction[];
  categories: Category[];
  currentBudget: MonthlyBudget;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  deleteCategory: (id: string) => void;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

const STORAGE_KEYS = {
  TRANSACTIONS: 'budget_transactions',
  CATEGORIES: 'budget_categories',
  CURRENT_BUDGET: 'budget_current'
} as const;

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return stored ? JSON.parse(stored) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const savedCategories = localStorage.getItem('categories');
    return savedCategories ? JSON.parse(savedCategories) : defaultCategories;
  });

  const [currentBudget] = useState<MonthlyBudget>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_BUDGET);
    return stored ? JSON.parse(stored) : {
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      disposableIncome: 0,
      plannedIncome: 0,
      plannedExpenses: 0,
      actualIncome: 0,
      actualExpenses: 0
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_BUDGET, JSON.stringify(currentBudget));
  }, [currentBudget]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory = {
      ...category,
      id: crypto.randomUUID()
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  return (
    <BudgetContext.Provider
      value={{
        transactions,
        categories,
        currentBudget,
        addTransaction,
        addCategory,
        deleteTransaction,
        deleteCategory
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}; 