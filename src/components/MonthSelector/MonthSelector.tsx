import { useBudget } from '../../contexts/BudgetContext';
import styles from './MonthSelector.module.css';

export const MonthSelector = () => {
  const { selectedDate, goToPreviousMonth, goToNextMonth, selectMonth } = useBudget();

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    selectMonth(new Date(e.target.value));
  };

  return (
    <div className={styles.monthSelector}>
      <button onClick={goToPreviousMonth} className={styles.arrowButton}>
        ←
      </button>
      
      <div className={styles.currentMonth}>
        <input
          type="month"
          value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
          onChange={handleMonthChange}
          className={styles.monthInput}
        />
        <span className={styles.monthLabel}>
          {formatMonth(selectedDate)}
        </span>
      </div>

      <button onClick={goToNextMonth} className={styles.arrowButton}>
        →
      </button>
    </div>
  );
}; 