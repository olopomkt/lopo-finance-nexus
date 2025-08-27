
// Re-export everything from finance.ts to maintain existing imports
export * from './finance';

// Add the CombinedEntry type that combines all transaction types
export interface CombinedEntry {
  id: string;
  type: 'revenue' | 'company_expense' | 'personal_expense';
  date: Date;
  amount: number;
  description?: string;
  client?: string; // For revenues
  details?: string; // For personal expenses
  category?: string; // For company expenses
  paymentMethod?: string;
  createdAt: Date;
}
