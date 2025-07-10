
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PaymentMethod, ContractType, ExpenseType, AccountType } from '@/types/finance';

export interface GlobalFilterState {
  searchTerm: string;
  paymentMethod: PaymentMethod | 'all';
  contractType: ContractType | 'all';
  expenseType: ExpenseType | 'all';
  accountType: AccountType | 'all';
  status: 'all' | 'received' | 'pending' | 'paid' | 'unpaid';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  priceRange: {
    min: number | null;
    max: number | null;
  };
  sortBy: 'date' | 'price' | 'name';
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: GlobalFilterState = {
  searchTerm: '',
  paymentMethod: 'all',
  contractType: 'all',
  expenseType: 'all',
  accountType: 'all',
  status: 'all',
  dateRange: { start: null, end: null },
  priceRange: { min: null, max: null },
  sortBy: 'date',
  sortOrder: 'desc'
};

interface FilterContextType {
  filters: GlobalFilterState;
  updateFilter: <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => void;
  clearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<GlobalFilterState>(defaultFilters);

  const updateFilter = <K extends keyof GlobalFilterState>(key: K, value: GlobalFilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{ filters, updateFilter, clearFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useGlobalFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useGlobalFilters must be used within a FilterProvider');
  }
  return context;
};
