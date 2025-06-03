
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';

const STORAGE_KEYS = {
  COMPANY_REVENUES: 'lopo_company_revenues',
  COMPANY_EXPENSES: 'lopo_company_expenses',
  PERSONAL_EXPENSES: 'lopo_personal_expenses'
};

export const storageService = {
  // Company Revenues
  getCompanyRevenues(): CompanyRevenue[] {
    const data = localStorage.getItem(STORAGE_KEYS.COMPANY_REVENUES);
    if (!data) return [];
    return JSON.parse(data).map((item: any) => ({
      ...item,
      paymentDate: new Date(item.paymentDate),
      createdAt: new Date(item.createdAt)
    }));
  },

  saveCompanyRevenue(revenue: Omit<CompanyRevenue, 'id' | 'createdAt'>): CompanyRevenue {
    const revenues = this.getCompanyRevenues();
    const newRevenue: CompanyRevenue = {
      ...revenue,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    revenues.push(newRevenue);
    localStorage.setItem(STORAGE_KEYS.COMPANY_REVENUES, JSON.stringify(revenues));
    return newRevenue;
  },

  updateCompanyRevenue(id: string, revenue: Partial<CompanyRevenue>): void {
    const revenues = this.getCompanyRevenues();
    const index = revenues.findIndex(r => r.id === id);
    if (index !== -1) {
      revenues[index] = { ...revenues[index], ...revenue };
      localStorage.setItem(STORAGE_KEYS.COMPANY_REVENUES, JSON.stringify(revenues));
    }
  },

  deleteCompanyRevenue(id: string): void {
    const revenues = this.getCompanyRevenues().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMPANY_REVENUES, JSON.stringify(revenues));
  },

  // Company Expenses
  getCompanyExpenses(): CompanyExpense[] {
    const data = localStorage.getItem(STORAGE_KEYS.COMPANY_EXPENSES);
    if (!data) return [];
    return JSON.parse(data).map((item: any) => ({
      ...item,
      paymentDate: new Date(item.paymentDate),
      createdAt: new Date(item.createdAt)
    }));
  },

  saveCompanyExpense(expense: Omit<CompanyExpense, 'id' | 'createdAt'>): CompanyExpense {
    const expenses = this.getCompanyExpenses();
    const newExpense: CompanyExpense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    expenses.push(newExpense);
    localStorage.setItem(STORAGE_KEYS.COMPANY_EXPENSES, JSON.stringify(expenses));
    return newExpense;
  },

  updateCompanyExpense(id: string, expense: Partial<CompanyExpense>): void {
    const expenses = this.getCompanyExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...expense };
      localStorage.setItem(STORAGE_KEYS.COMPANY_EXPENSES, JSON.stringify(expenses));
    }
  },

  deleteCompanyExpense(id: string): void {
    const expenses = this.getCompanyExpenses().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMPANY_EXPENSES, JSON.stringify(expenses));
  },

  // Personal Expenses
  getPersonalExpenses(): PersonalExpense[] {
    const data = localStorage.getItem(STORAGE_KEYS.PERSONAL_EXPENSES);
    if (!data) return [];
    return JSON.parse(data).map((item: any) => ({
      ...item,
      paymentDate: new Date(item.paymentDate),
      createdAt: new Date(item.createdAt)
    }));
  },

  savePersonalExpense(expense: Omit<PersonalExpense, 'id' | 'createdAt'>): PersonalExpense {
    const expenses = this.getPersonalExpenses();
    const newExpense: PersonalExpense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    expenses.push(newExpense);
    localStorage.setItem(STORAGE_KEYS.PERSONAL_EXPENSES, JSON.stringify(expenses));
    return newExpense;
  },

  updatePersonalExpense(id: string, expense: Partial<PersonalExpense>): void {
    const expenses = this.getPersonalExpenses();
    const index = expenses.findIndex(e => e.id === id);
    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...expense };
      localStorage.setItem(STORAGE_KEYS.PERSONAL_EXPENSES, JSON.stringify(expenses));
    }
  },

  deletePersonalExpense(id: string): void {
    const expenses = this.getPersonalExpenses().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.PERSONAL_EXPENSES, JSON.stringify(expenses));
  }
};
