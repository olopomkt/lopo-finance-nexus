import { useState, useMemo } from 'react';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types/finance';
import { GlobalFilterState } from '@/contexts/FilterContext';

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

interface UseAdvancedFiltersProps {
  companyRevenues: CompanyRevenue[];
  companyExpenses: CompanyExpense[];
  personalExpenses: PersonalExpense[];
}

export const useAdvancedFilters = ({
  companyRevenues,
  companyExpenses,
  personalExpenses
}: UseAdvancedFiltersProps) => {
  const [filters, setFilters] = useState<GlobalFilterState>(defaultFilters);

  const filteredData = useMemo(() => {
    // Filtrar receitas
    const filteredRevenues = companyRevenues.filter(revenue => {
      // Filtro de busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          revenue.clientName.toLowerCase().includes(searchLower) ||
          revenue.service.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro de método de pagamento
      if (filters.paymentMethod !== 'all' && revenue.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      // Filtro de tipo de contrato
      if (filters.contractType !== 'all' && revenue.contractType !== filters.contractType) {
        return false;
      }

      // Filtro de tipo de conta
      if (filters.accountType !== 'all' && revenue.accountType !== filters.accountType) {
        return false;
      }

      // Filtro de status
      if (filters.status !== 'all') {
        if (filters.status === 'received' && !revenue.received) return false;
        if (filters.status === 'pending' && revenue.received) return false;
      }

      // Filtro de data
      if (filters.dateRange.start && revenue.paymentDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && revenue.paymentDate > filters.dateRange.end) {
        return false;
      }

      // Filtro de preço
      if (filters.priceRange.min !== null && revenue.price < filters.priceRange.min) {
        return false;
      }
      if (filters.priceRange.max !== null && revenue.price > filters.priceRange.max) {
        return false;
      }

      return true;
    });

    // Filtrar despesas empresariais
    const filteredCompanyExpenses = companyExpenses.filter(expense => {
      // Filtro de busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = expense.name.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro de método de pagamento
      if (filters.paymentMethod !== 'all' && expense.paymentMethod !== filters.paymentMethod) {
        return false;
      }

      // Filtro de tipo de despesa
      if (filters.expenseType !== 'all' && expense.type !== filters.expenseType) {
        return false;
      }

      // Filtro de status
      if (filters.status !== 'all') {
        if (filters.status === 'paid' && !expense.paid) return false;
        if (filters.status === 'unpaid' && expense.paid) return false;
      }

      // Filtro de data
      if (filters.dateRange.start && expense.paymentDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && expense.paymentDate > filters.dateRange.end) {
        return false;
      }

      // Filtro de preço
      if (filters.priceRange.min !== null && expense.price < filters.priceRange.min) {
        return false;
      }
      if (filters.priceRange.max !== null && expense.price > filters.priceRange.max) {
        return false;
      }

      return true;
    });

    // Filtrar despesas pessoais
    const filteredPersonalExpenses = personalExpenses.filter(expense => {
      // Filtro de busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          expense.name.toLowerCase().includes(searchLower) ||
          (expense.observation && expense.observation.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Filtro de status
      if (filters.status !== 'all') {
        if (filters.status === 'paid' && !expense.paid) return false;
        if (filters.status === 'unpaid' && expense.paid) return false;
      }

      // Filtro de data
      if (filters.dateRange.start && expense.paymentDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && expense.paymentDate > filters.dateRange.end) {
        return false;
      }

      // Filtro de preço
      if (filters.priceRange.min !== null && expense.price < filters.priceRange.min) {
        return false;
      }
      if (filters.priceRange.max !== null && expense.price > filters.priceRange.max) {
        return false;
      }

      return true;
    });

    return {
      companyRevenues: filteredRevenues,
      companyExpenses: filteredCompanyExpenses,
      personalExpenses: filteredPersonalExpenses
    };
  }, [companyRevenues, companyExpenses, personalExpenses, filters]);

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = () => {
    return JSON.stringify(filters) !== JSON.stringify(defaultFilters);
  };

  return {
    filters,
    setFilters,
    filteredData,
    clearFilters,
    hasActiveFilters
  };
};
