
// Import the finance types first
export * from './finance';

// Import the specific types we need for the union
import type { CompanyRevenue, CompanyExpense, PersonalExpense } from './finance';

// Combined entry type for unified filtering
export type CombinedEntry = CompanyRevenue | CompanyExpense | PersonalExpense;

// Manter compatibilidade com tipos legados se necessário
export type {
  CompanyRevenue,
  CompanyExpense,
  PersonalExpense,
  PaymentMethod,
  ContractType,
  ExpenseType,
  AccountType
} from './finance';
