import { useState } from 'react';
import { useBudget } from '../../contexts/BudgetContext';
import styles from './AddCategoryModal.module.css';

interface AddCategoryModalProps {
  onClose: () => void;
  currentType: 'income' | 'expense';
}

export const AddCategoryModal = ({ onClose, currentType }: AddCategoryModalProps) => {
  const { addCategory } = useBudget();
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: currentType,
    icon: '📦'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory({
      ...newCategory,
      isDefault: false
    });
    onClose();
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3>Nouvelle catégorie</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Nom de la catégorie"
              value={newCategory.name}
              onChange={e => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              required
              maxLength={9}
              className={styles.modalInput}
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              placeholder="Emoji (ex: 📦)"
              value={newCategory.icon}
              onChange={e => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
              required
              maxLength={2}
              className={styles.modalInput}
            />
          </div>

          <div className={styles.modalButtons}>
            <button 
              type="button" 
              onClick={onClose}
              className={styles.modalCancelButton}
            >
              Annuler
            </button>
            <button 
              type="submit"
              className={styles.modalSubmitButton}
            >
              Ajouter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};