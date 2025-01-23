import { useState } from 'react';
import { useBudget } from '../../contexts/BudgetContext';
import styles from './TransactionForm.module.css';
import { AddCategoryModal } from '../AddCategoryModal/AddCategoryModal';

export const TransactionForm = () => {
  const { addTransaction, categories, deleteCategory } = useBudget();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [expenseCurrentPage, setExpenseCurrentPage] = useState(0);
  const [incomeCurrentPage, setIncomeCurrentPage] = useState(0);
  
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    date: new Date(),
    isRecurring: false,
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly',
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)) // Par défaut : 1 mois plus tard
  });

  const ITEMS_PER_PAGE = 9;
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  const incomeCategories = categories.filter(cat => cat.type === 'income');

  const currentCategories = formData.type === 'expense' ? expenseCategories : incomeCategories;
  const currentPage = formData.type === 'expense' ? expenseCurrentPage : incomeCurrentPage;
  const setCurrentPage = formData.type === 'expense' ? setExpenseCurrentPage : setIncomeCurrentPage;

  const totalPages = Math.ceil(currentCategories.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const displayedCategories = currentCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      deleteCategory(id);
      if (displayedCategories.length === 1 && currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      }
      if (formData.category === id) {
        setFormData(prev => ({ ...prev, category: '' }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const transaction = {
      amount: Number(formData.amount),
      type: formData.type,
      category: formData.category,
      description: formData.description,
      date: formData.date,
      isRecurring: formData.isRecurring,
      ...(formData.isRecurring && {
        frequency: formData.frequency,
        startDate: formData.startDate,
        endDate: formData.endDate
      })
    };

    addTransaction(transaction);
    
    setFormData({
      amount: '',
      type: 'expense',
      category: '',
      description: '',
      date: new Date(),
      isRecurring: false,
      frequency: 'monthly',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
    });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, dateType: 'date' | 'startDate' | 'endDate') => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setFormData(prev => ({ 
        ...prev, 
        [dateType]: newDate
      }));
    }
  };

  return (
    <>
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

        <div className={styles.dateSection}>
          <div className={styles.dateTypeToggle}>
            <button
              type="button"
              className={`${styles.dateTypeButton} ${!formData.isRecurring ? styles.active : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, isRecurring: false }))}
            >
              Date unique
            </button>
            <button
              type="button"
              className={`${styles.dateTypeButton} ${formData.isRecurring ? styles.active : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, isRecurring: true }))}
            >
              Récurrent
            </button>
          </div>

          {!formData.isRecurring ? (
            <div className={styles.singleDateGroup}>
              <label>Date de la transaction</label>
              <input
                type="date"
                value={formData.date.toLocaleDateString('fr-CA')}
                onChange={e => handleDateChange(e, 'date')}
                className={styles.dateInput}
                min="1900-01-01"
                max="2100-12-31"
                onKeyDown={e => e.preventDefault()}
              />
            </div>
          ) : (
            <div className={styles.recurrenceDetails}>
              <select
                value={formData.frequency}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  frequency: e.target.value as 'daily' | 'weekly' | 'monthly' 
                }))}
                className={styles.frequencySelect}
              >
                <option value="daily">Tous les jours</option>
                <option value="weekly">Toutes les semaines</option>
                <option value="monthly">Tous les mois</option>
              </select>

              <div className={styles.dateInputs}>
                <div className={styles.dateGroup}>
                  <label>Date de début</label>
                  <input
                    type="date"
                    value={formData.startDate.toLocaleDateString('fr-CA')}
                    onChange={e => handleDateChange(e, 'startDate')}
                    className={styles.dateInput}
                    min="1900-01-01"
                    max="2100-12-31"
                    onKeyDown={e => e.preventDefault()}
                  />
                </div>

                <div className={styles.dateGroup}>
                  <label>Date de fin</label>
                  <input
                    type="date"
                    value={formData.endDate.toLocaleDateString('fr-CA')}
                    onChange={e => handleDateChange(e, 'endDate')}
                    className={styles.dateInput}
                    min={formData.startDate.toLocaleDateString('fr-CA')}
                    max="2100-12-31"
                    onKeyDown={e => e.preventDefault()}
                  />
                </div>
              </div>
            </div>
          )}
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
            onWheel={e => e.target.blur()}
            className={styles.amountInput}
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
          <div className={styles.categoryHeader}>
            <h4 className={styles.categoryTitle}>Catégorie</h4>
            <button
              type="button"
              onClick={() => setShowCategoryModal(true)}
              className={styles.addCategoryButton}
            >
              + Ajouter
            </button>
          </div>

          <div className={styles.categoryGrid}>
            {displayedCategories.map(cat => (
              <div
                key={cat.id}
                className={`${styles.categoryButton} ${formData.category === cat.id ? styles.active : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setFormData(prev => ({ ...prev, category: cat.id }));
                  }
                }}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryName}>{cat.name}</span>
                {!cat.isDefault && (
                  <div
                    role="button"
                    tabIndex={0}
                    className={styles.deleteCategoryButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat.id, e);
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id, e as any);
                      }
                    }}
                    title="Supprimer la catégorie"
                  >
                    🗑️
                  </div>
                )}
              </div>
            ))}
          </div>

          {currentCategories.length > 0 && (
            <div className={styles.pagination}>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 0}
                className={styles.paginationButton}
              >
                ←
              </button>
              <span>
                {currentPage + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === Math.max(0, totalPages - 1)}
                className={styles.paginationButton}
              >
                →
              </button>
            </div>
          )}
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

      {showCategoryModal && (
        <AddCategoryModal
          onClose={() => setShowCategoryModal(false)}
          currentType={formData.type}
        />
      )}
    </>
  );
}; 