import { useState } from 'react';
import { useBudget } from '../../contexts/BudgetContext';
import styles from './TransactionForm.module.css';

export const TransactionForm = () => {
  const { addTransaction, categories } = useBudget();
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    isRecurring: false,
    recurringDay: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction = {
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      date: new Date(),
      isRecurring: formData.isRecurring,
      recurringDay: formData.isRecurring ? Number(formData.recurringDay) : undefined
    };

    addTransaction(transaction);
    
    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      isRecurring: false,
      recurringDay: ''
    });
  };

  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.title}>Nouvelle transaction</h3>
      
      <div className={styles.formGroup}>
        <input
          type="text"
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required
          placeholder="Salaire, cadeau, etc."
          maxLength={25}
          className={styles.descriptionInput}
        />
      </div>

      <div className={styles.amountInput}>
        <input
          type="number"
          value={formData.amount}
          onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          required
          step="0.01"
          placeholder="50.65"
          max={9999}
        />
        <span className={styles.currencySymbol}>€</span>
      </div>

      <div className={styles.typeButtons}>
        <button
          type="button"
          className={`${styles.typeButton} ${formData.type === 'expense' ? styles.active : ''} ${styles.expenseButton}`}
          onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
        >
          Dépense
        </button>
        <button
          type="button"
          className={`${styles.typeButton} ${formData.type === 'income' ? styles.active : ''} ${styles.incomeButton}`}
          onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
        >
          Revenu
        </button>
      </div>

      <div className={styles.categoriesSection}>
        <h4 className={styles.categoryTitle}>Catégorie</h4>
        <div className={styles.categoryGrid}>
          {(formData.type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.categoryButton} ${formData.category === cat.id ? styles.active : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span className={styles.categoryName}>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.recurringGroup}>
        <label className={styles.recurringLabel}>
          <input
            type="checkbox"
            checked={formData.isRecurring}
            onChange={e => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
          />
          <span>Transaction récurrente</span>
        </label>

        <input
          type="number"
          min="1"
          max="31"
          value={formData.recurringDay}
          onChange={e => setFormData(prev => ({ ...prev, recurringDay: e.target.value }))}
          disabled={!formData.isRecurring}
          required={formData.isRecurring}
          placeholder="Jour du mois"
          className={styles.dayInput}
        />
      </div>

      <button type="submit" className={styles.submitButton}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Ajouter la transaction
      </button>
    </form>
  );
}; 