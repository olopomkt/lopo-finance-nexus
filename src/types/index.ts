
// Re-export dos tipos financeiros
export * from './finance';

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
