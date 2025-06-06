
export interface CompanyRevenue {
  id: string;
  clientName: string;
  service: string;
  price: number;
  paymentMethod: 'Pix' | 'Cartão' | 'Outro';
  contractType: 'único' | 'mensal';
  contractMonths?: number;
  paymentDate: Date;
  accountType: 'Marlon Lopo' | 'Infinity B2B';
  received: boolean;
  receivedDate?: Date;
  createdAt: Date;
}

export interface CompanyExpense {
  id: string;
  name: string;
  price: number;
  paymentMethod: 'Pix' | 'Cartão' | 'Outro';
  type: 'Assinatura' | 'Único';
  paymentDate: Date;
  paid: boolean;
  paidDate?: Date;
  createdAt: Date;
}

export interface PersonalExpense {
  id: string;
  name: string;
  price: number;
  paymentDate: Date;
  observation?: string;
  paid: boolean;
  paidDate?: Date;
  createdAt: Date;
}

export type PaymentMethod = 'Pix' | 'Cartão' | 'Outro';
export type ContractType = 'único' | 'mensal';
export type ExpenseType = 'Assinatura' | 'Único';
export type AccountType = 'Marlon Lopo' | 'Infinity B2B';
