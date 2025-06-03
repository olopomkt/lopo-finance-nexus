
export interface CompanyRevenue {
  id: string;
  clientName: string;
  service: string;
  price: number;
  paymentMethod: 'Pix' | 'Cartão' | 'Outro';
  contractType: 'único' | 'mensal';
  contractMonths?: number;
  paymentDate: Date;
  createdAt: Date;
}

export interface CompanyExpense {
  id: string;
  name: string;
  price: number;
  paymentMethod: 'Pix' | 'Cartão' | 'Outro';
  type: 'Assinatura' | 'Único';
  paymentDate: Date;
  createdAt: Date;
}

export interface PersonalExpense {
  id: string;
  name: string;
  price: number;
  paymentDate: Date;
  observation?: string;
  createdAt: Date;
}

export type PaymentMethod = 'Pix' | 'Cartão' | 'Outro';
export type ContractType = 'único' | 'mensal';
export type ExpenseType = 'Assinatura' | 'Único';
