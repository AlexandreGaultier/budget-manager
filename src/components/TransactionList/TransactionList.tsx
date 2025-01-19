import { useBudget } from '../../contexts/BudgetContext';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from './TransactionList.module.css';
import { useState } from 'react';
import { EditTransactionModal } from '../EditTransactionModal/EditTransactionModal';

export const TransactionList = () => {
  const { 
    deleteTransaction, 
    deleteRecurringTransactions,
    categories,
    getTransactions,
    viewMode
  } = useBudget();
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const currentTransactions = getTransactions();

  const filteredTransactions = currentTransactions
    .filter(transaction => {
      if (selectedType !== 'all' && transaction.type !== selectedType) return false;
      if (selectedCategory && transaction.category !== selectedCategory) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const uniqueCategories = Array.from(new Set(
    currentTransactions
      .filter(t => selectedType === 'all' || t.type === selectedType)
      .map(t => t.category)
  )).map(categoryId => {
    const category = categories.find(cat => cat.id === categoryId);
    return {
      id: categoryId,
      name: category?.name || 'Non catégorisé',
      icon: category?.icon || '📋'
    };
  });

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return {
      name: category?.name || 'Non catégorisé',
      icon: category?.icon || '📋'
    };
  };

  const handleDelete = (transaction: Transaction) => {
    if (!transaction.isRecurring) {
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer la transaction "${transaction.description}" ?`)) {
        deleteTransaction(transaction.id);
      }
      return;
    }

    // Pour les transactions récurrentes, on ouvre la modale
    setDeletingTransaction(transaction);
  };

  const handleDeleteChoice = (choice: 'single' | 'all' | 'cancel') => {
    if (!deletingTransaction) return;

    if (choice === 'single') {
      deleteTransaction(deletingTransaction.id);
    } else if (choice === 'all') {
      deleteRecurringTransactions(deletingTransaction);
    }

    setDeletingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const filteredTotal = filteredTransactions.reduce((total, transaction) => {
    return total + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
  }, 0);

  if (filteredTransactions.length === 0) {
    return (
      <div className={styles.container}>
        <h2>Transactions {viewMode === 'month' ? 'du mois' : "de l'année"}</h2>
        <div className={styles.emptyState}>
          <p>Aucune transaction pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Transactions {viewMode === 'month' ? 'du mois' : "de l'année"}</h2>
      
      <div className={styles.filtersContainer}>
        <div className={styles.typeFilters}>
          <button
            className={`${styles.typeButton} ${selectedType === 'all' ? styles.active : ''}`}
            onClick={() => setSelectedType('all')}
          >
            Tout
          </button>
          <button
            className={`${styles.typeButton} ${styles.incomeButton} ${selectedType === 'income' ? styles.active : ''}`}
            onClick={() => {
              setSelectedType('income');
              setSelectedCategory(null);
            }}
          >
            Revenus
          </button>
          <button
            className={`${styles.typeButton} ${styles.expenseButton} ${selectedType === 'expense' ? styles.active : ''}`}
            onClick={() => {
              setSelectedType('expense');
              setSelectedCategory(null);
            }}
          >
            Dépenses
          </button>
        </div>

        <div className={styles.filterHeader}>
          <div className={styles.filtersScroll}>
            <button
              className={`${styles.filterChip} ${!selectedCategory ? styles.active : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              Toutes les catégories
            </button>
            {uniqueCategories.map(category => (
              <button
                key={category.id}
                className={`${styles.filterChip} ${selectedCategory === category.id ? styles.active : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className={styles.filterIcon}>{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
          <div className={`${styles.filterTotal} ${filteredTotal >= 0 ? styles.positive : styles.negative}`}>
            Total: {formatCurrency(filteredTotal)}
          </div>
        </div>
      </div>

      <div className={styles.list}>
        {filteredTransactions.map(transaction => {
          const category = getCategoryInfo(transaction.category);
          return (
            <div 
              key={transaction.id} 
              className={`${styles.transaction} ${
                transaction.type === 'income' ? styles.income : styles.expense
              }`}
            >
              <div className={styles.transactionMain}>
                <div className={styles.transactionLeft}>
                  <div className={styles.transactionInfo}>
                    <span className={styles.description}>
                      {transaction.description}
                    </span>
                    <span className={styles.category}>
                      <span className={styles.categoryIcon}>{category.icon}</span>
                      {category.name}
                    </span>
                  </div>
                  {transaction.isRecurring && (
                    <div className={styles.recurringBadge}>
                      Récurrent {transaction.frequency === 'daily' ? 'tous les jours ' : 
                                 transaction.frequency === 'weekly' ? 'toutes les semaines ' : 
                                 transaction.frequency === 'monthly' ? 'tous les mois ' : ''} 
                      du {formatDate(transaction.startDate || new Date()) + ' au ' + formatDate(transaction.endDate || new Date())}
                    </div>
                  )}
                </div>
                <div className={styles.transactionRight}>
                  <div className={styles.transactionAmount}>
                    <span className={styles.date}>
                      {formatDate(transaction.date)}
                    </span>
                    <span className={styles.amount}>
                      {transaction.type === 'expense' ? '- ' : '+ '}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                  <div className={styles.transactionActions}>
                    <button 
                      onClick={() => handleEdit(transaction)}
                      className={styles.editButton}
                      aria-label="Modifier la transaction"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(transaction)}
                      className={styles.deleteButton}
                      aria-label="Supprimer la transaction"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {deletingTransaction && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Supprimer la transaction</h3>
            <p>Que souhaitez-vous faire avec "{deletingTransaction.description}" ?</p>
            
            <div className={styles.modalButtons}>
              <button 
                onClick={() => handleDeleteChoice('single')}
                className={styles.modalDeleteButton}
              >
                Supprimer uniquement cette transaction
              </button>
              <button 
                onClick={() => handleDeleteChoice('all')}
                className={`${styles.modalDeleteButton} ${styles.modalDeleteAllButton}`}
              >
                Supprimer toutes les occurrences
              </button>
              <button 
                onClick={() => handleDeleteChoice('cancel')}
                className={styles.modalCancelButton}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 