import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
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
  updateTransaction: (id: string, updatedData: Partial<Omit<Transaction, 'id'>>) => void;
  selectedDate: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  selectMonth: (date: Date) => void;
  getMonthTransactions: (date: Date) => Transaction[];
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
    const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
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

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
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
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCategories));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const deleteCategory = (id: string) => {
    const categoryToDelete = categories.find(cat => cat.id === id);
    
    if (categoryToDelete?.isDefault) {
      alert("Les catégories par défaut ne peuvent pas être supprimées.");
      return;
    }

    const updatedCategories = categories.filter(c => c.id !== id);
    setCategories(updatedCategories);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(updatedCategories));
  };

  const updateTransaction = (id: string, updatedData: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev => prev.map(transaction => 
      transaction.id === id 
        ? { ...transaction, ...updatedData }
        : transaction
    ));
  };

  const getMonthTransactions = useCallback((date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }, [transactions]);

  const goToPreviousMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const selectMonth = (date: Date) => {
    setSelectedDate(new Date(date.getFullYear(), date.getMonth(), 1));
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
        deleteCategory,
        updateTransaction,
        selectedDate,
        goToPreviousMonth,
        goToNextMonth,
        selectMonth,
        getMonthTransactions,
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