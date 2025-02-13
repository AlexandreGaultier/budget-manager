export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Date;
  isRecurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  startDate?: Date;
  endDate?: Date;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault: boolean;
  icon: string;
}

export interface MonthlyBudget {
  month: number;
  year: number;
  disposableIncome: number;
  plannedIncome: number;
  plannedExpenses: number;
  actualIncome: number;
  actualExpenses: number;
} 