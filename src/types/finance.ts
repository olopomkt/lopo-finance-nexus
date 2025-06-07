
export interface BaseTransaction {
  id: string;
  name: string;
  price: number;
  paymentDate: Date;
  paid: boolean;
  paidDate?: Date;
  createdAt: Date;
}

export interface CompanyRevenue {
  id: string;
  clientName: string;
  service: string;
  price: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  contractType: ContractType;
  contractMonths?: number;
  accountType: AccountType;
  received: boolean;
  receivedDate?: Date;
  createdAt: Date;
}

export interface CompanyExpense extends BaseTransaction {
  paymentMethod: PaymentMethod;
  type: ExpenseType;
}

export interface PersonalExpense extends BaseTransaction {
  observation?: string;
}

export type PaymentMethod = 'Pix' | 'Cartão' | 'Outro';
export type ContractType = 'único' | 'mensal';
export type ExpenseType = 'Assinatura' | 'Único';
export type AccountType = 'Marlon Lopo' | 'Infinity B2B';

export type TransactionType = CompanyRevenue | CompanyExpense | PersonalExpense;

// Form data types para garantir tipagem consistente
export interface CompanyRevenueFormData {
  clientName: string;
  service: string;
  price: number;
  paymentMethod: PaymentMethod;
  contractType: ContractType;
  contractMonths?: number;
  paymentDate: Date;
  accountType: AccountType;
  received: boolean;
  receivedDate?: Date;
}

export interface CompanyExpenseFormData {
  name: string;
  price: number;
  paymentMethod: PaymentMethod;
  type: ExpenseType;
  paymentDate: Date;
}

export interface PersonalExpenseFormData {
  name: string;
  price: number;
  paymentDate: Date;
  observation?: string;
}
