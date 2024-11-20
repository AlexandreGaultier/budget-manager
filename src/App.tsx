import { BudgetProvider } from './contexts/BudgetContext';
import { MonthlyOverview } from './components/MonthlyOverview/MonthlyOverview';
import { TransactionForm } from './components/TransactionForm/TransactionForm';
import { TransactionList } from './components/TransactionList/TransactionList';
import './App.css';

function App() {
  return (
    <BudgetProvider>
      <div className="app">
        <h1>Budget Manager</h1>
        <MonthlyOverview />
        <div className="content">
          <TransactionForm />
          <TransactionList />
        </div>
      </div>
    </BudgetProvider>
  );
}

export default App;
