import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Transaction, Category, MonthlyBudget } from '../types';
import { defaultCategories } from '../data/defaultCategories';

interface BudgetContextType {
  selectedDate: Date;
  viewMode: 'month' | 'year';
  setViewMode: (mode: 'month' | 'year') => void;
  goToPreviousPeriod: () => void;
  goToNextPeriod: () => void;
  selectDate: (date: Date) => void;
  getTransactions: () => Transaction[];
  transactions: Transaction[];
  categories: Category[];
  currentBudget: MonthlyBudget;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  deleteCategory: (id: string) => void;
  updateTransaction: (id: string, updatedData: Partial<Omit<Transaction, 'id'>>) => void;
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

  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_BUDGET, JSON.stringify(currentBudget));
  }, [currentBudget]);

  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    if (!transactionData.isRecurring) {
      const newTransaction = {
        ...transactionData,
        id: crypto.randomUUID()
      };
      setTransactions(prev => [...prev, newTransaction]);
      return;
    }

    const newTransactions: Transaction[] = [];
    const startDate = new Date(transactionData.startDate!);
    const endDate = new Date(transactionData.endDate!);
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      newTransactions.push({
        ...transactionData,
        id: crypto.randomUUID(),
        date: new Date(currentDate),
      });

      switch (transactionData.frequency) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    setTransactions(prev => [...prev, ...newTransactions]);
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

  const goToPreviousPeriod = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      if (viewMode === 'month') {
        newDate.setMonth(prevDate.getMonth() - 1);
      } else {
        newDate.setFullYear(prevDate.getFullYear() - 1);
      }
      return newDate;
    });
  };

  const goToNextPeriod = () => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      if (viewMode === 'month') {
        newDate.setMonth(prevDate.getMonth() + 1);
      } else {
        newDate.setFullYear(prevDate.getFullYear() + 1);
      }
      return newDate;
    });
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const getTransactions = () => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      if (viewMode === 'month') {
        return transactionDate.getMonth() === selectedDate.getMonth() && 
               transactionDate.getFullYear() === selectedDate.getFullYear();
      } else {
        return transactionDate.getFullYear() === selectedDate.getFullYear();
      }
    });
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
        viewMode,
        setViewMode,
        goToPreviousPeriod,
        goToNextPeriod,
        selectDate,
        getTransactions,
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