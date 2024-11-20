import { useBudget } from '../../contexts/BudgetContext';
import { Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import styles from './TransactionList.module.css';

export const TransactionList = () => {
  const { transactions, deleteTransaction, categories } = useBudget();

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const getCategoryInfo = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return {
      name: category?.name || 'Non catégorisé',
      icon: category?.icon || '📋'
    };
  };

  const handleDelete = (transaction: Transaction) => {
    const message = transaction.isRecurring 
      ? `Êtes-vous sûr de vouloir supprimer cette transaction récurrente "${transaction.description}" ?`
      : `Êtes-vous sûr de vouloir supprimer la transaction "${transaction.description}" ?`;

    if (window.confirm(message)) {
      deleteTransaction(transaction.id);
    }
  };

  if (sortedTransactions.length === 0) {
    return (
      <div className={styles.container}>
        <h2>Transactions récentes</h2>
        <div className={styles.emptyState}>
          <p>Aucune transaction pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2>Transactions récentes</h2>
      <div className={styles.list}>
        {sortedTransactions.map(transaction => {
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
                      Récurrent (Jour {transaction.recurringDay})
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
          );
        })}
      </div>
    </div>
  );
}; 