import { useBudget } from '../../contexts/BudgetContext';
import { formatCurrency } from '../../utils/formatters';
import styles from './MonthlyOverview.module.css';

export const MonthlyOverview = () => {
  const { currentBudget, transactions } = useBudget();
  
  const currentMonthTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate.getMonth() === currentBudget.month && 
           transactionDate.getFullYear() === currentBudget.year;
  });

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const disposableIncome = totalIncome - totalExpenses;

  return (
    <div className={styles.overview}>
      <h2>Aperçu du mois</h2>
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