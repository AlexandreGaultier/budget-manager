import { useState } from 'react';
import { useBudget } from '../../contexts/BudgetContext';
import { Transaction } from '../../types';
import styles from './EditTransactionModal.module.css';

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export const EditTransactionModal = ({ transaction, onClose }: EditTransactionModalProps) => {
  const { categories, updateTransaction } = useBudget();
  const [formData, setFormData] = useState({
    description: transaction.description,
    amount: transaction.amount,
    category: transaction.category,
    date: new Date(transaction.date).toLocaleDateString('fr-CA'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTransaction(transaction.id, {
      ...formData,
      amount: Number(formData.amount),
      date: new Date(formData.date),
    });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Modifier la transaction</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              maxLength={25}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Montant</label>
            <input
              type="number"
              value={formData.amount}
              onChange={e => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
              required
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div className={styles.categoriesSection}>
            <label>Catégorie</label>
            <div className={styles.categoryGrid}>
              {categories
                .filter(cat => cat.type === transaction.type)
                .map(cat => (
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

          <div className={styles.buttons}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Annuler
            </button>
            <button type="submit" className={styles.submitButton}>
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 