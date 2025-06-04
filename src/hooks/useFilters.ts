
import { useState, useMemo, useCallback } from 'react';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';

export interface FilterState {
  searchTerm: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  paymentMethod: string | null;
  sortBy: 'date' | 'price' | 'name';
  sortOrder: 'asc' | 'desc';
}

const initialFilters: FilterState = {
  searchTerm: '',
  dateFrom: null,
  dateTo: null,
  paymentMethod: null,
  sortBy: 'date',
  sortOrder: 'desc'
};

export const useFilters = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const filterRevenues = useCallback((revenues: CompanyRevenue[]) => {
    return revenues.filter(revenue => {
      const matchesSearch = !filters.searchTerm || 
        revenue.clientName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        revenue.service.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesDateFrom = !filters.dateFrom || revenue.paymentDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || revenue.paymentDate <= filters.dateTo;
      const matchesPaymentMethod = !filters.paymentMethod || revenue.paymentMethod === filters.paymentMethod;

      return matchesSearch && matchesDateFrom && matchesDateTo && matchesPaymentMethod;
    }).sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'date':
          comparison = a.paymentDate.getTime() - b.paymentDate.getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.clientName.localeCompare(b.clientName);
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filters]);

  const filterCompanyExpenses = useCallback((expenses: CompanyExpense[]) => {
    return expenses.filter(expense => {
      const matchesSearch = !filters.searchTerm || 
        expense.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesDateFrom = !filters.dateFrom || expense.paymentDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || expense.paymentDate <= filters.dateTo;
      const matchesPaymentMethod = !filters.paymentMethod || expense.paymentMethod === filters.paymentMethod;

      return matchesSearch && matchesDateFrom && matchesDateTo && matchesPaymentMethod;
    }).sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'date':
          comparison = a.paymentDate.getTime() - b.paymentDate.getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filters]);

  const filterPersonalExpenses = useCallback((expenses: PersonalExpense[]) => {
    return expenses.filter(expense => {
      const matchesSearch = !filters.searchTerm || 
        expense.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (expense.observation && expense.observation.toLowerCase().includes(filters.searchTerm.toLowerCase()));
      
      const matchesDateFrom = !filters.dateFrom || expense.paymentDate >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || expense.paymentDate <= filters.dateTo;

      return matchesSearch && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'date':
          comparison = a.paymentDate.getTime() - b.paymentDate.getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filterRevenues,
    filterCompanyExpenses,
    filterPersonalExpenses
  };
};
