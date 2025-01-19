import { useBudget } from '../../contexts/BudgetContext';
import { formatCurrency } from '../../utils/formatters';
import styles from './MonthlyOverview.module.css';

export const MonthlyOverview = () => {
  const { 
    selectedDate, 
    viewMode,
    setViewMode,
    goToPreviousPeriod,
    goToNextPeriod,
    selectDate,
    getTransactions 
  } = useBudget();

  const currentTransactions = getTransactions();

  const totalIncome = currentTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const disposableIncome = totalIncome - totalExpenses;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.type === 'month') {
      const [year, month] = e.target.value.split('-').map(Number);
      selectDate(new Date(year, month - 1));
    } else {
      const year = parseInt(e.target.value);
      const newDate = new Date(selectedDate);
      newDate.setFullYear(year);
      selectDate(newDate);
    }
  };

  return (
    <div className={styles.overview}>
      <div className={styles.navigation}>
        <button onClick={goToPreviousPeriod} className={styles.navButton}>
          ←
        </button>

        <div className={styles.dateSelectors}>
          <div className={styles.viewToggle}>
            <button
              onClick={() => setViewMode('month')}
              className={`${styles.toggleButton} ${viewMode === 'month' ? styles.active : ''}`}
            >
              Mois
            </button>
            <button
              onClick={() => setViewMode('year')}
              className={`${styles.toggleButton} ${viewMode === 'year' ? styles.active : ''}`}
            >
              Année
            </button>
          </div>

          {viewMode === 'month' ? (
            <input
              type="month"
              value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
              onChange={handleDateChange}
              className={styles.monthPicker}
            />
          ) : (
            <select
              value={selectedDate.getFullYear()}
              onChange={handleDateChange}
              className={styles.yearPicker}
            >
              {Array.from({ length: 10 }, (_, i) => 
                selectedDate.getFullYear() - 5 + i
              ).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
        </div>

        <button onClick={goToNextPeriod} className={styles.navButton}>
          →
        </button>
      </div>

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