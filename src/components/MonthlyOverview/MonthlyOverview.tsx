import { useBudget } from '../../contexts/BudgetContext';
import { formatCurrency } from '../../utils/formatters';
import styles from './MonthlyOverview.module.css';
import { MonthSelector } from '../MonthSelector/MonthSelector';

export const MonthlyOverview = () => {
  const { selectedDate, getMonthTransactions } = useBudget();
  
  const monthTransactions = getMonthTransactions(selectedDate);

  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const disposableIncome = totalIncome - totalExpenses;

  return (
    <div className={styles.overview}>
      <MonthSelector />
      <div className={styles.stats}>
        <div className={styles.stat}>
          <h3>Revenus</h3>
          <p className={styles.income}>{formatCurrency(totalIncome)}</p>
        </div>
        <div className={styles.stat}>
          <h3>Dépenses</h3>
          <p className={styles.expense}>{formatCurrency(totalExpenses)}</p>
        </div>
        <div className={styles.stat}>
          <h3>Disponible</h3>
          <p className={disposableIncome >= 0 ? styles.income : styles.expense}>
            {formatCurrency(disposableIncome)}
          </p>
        </div>
      </div>
    </div>
  );
}; 