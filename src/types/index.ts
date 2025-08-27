
// Re-export dos tipos financeiros
export * from './finance';

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
