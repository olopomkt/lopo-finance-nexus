
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

type TransactionType = CompanyRevenue | CompanyExpense | PersonalExpense;

export const useUnifiedFilters = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const updateFilter = useCallback((key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, []);

  const filterTransactions = useMemo(() => {
    return <T extends TransactionType>(
      transactions: T[],
      type: 'revenue' | 'expense'
    ): T[] => {
      if (!transactions.length) return [];

      let filtered = [...transactions];

      // Filtro de busca por texto
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter((transaction) => {
          if ('clientName' in transaction) {
            // CompanyRevenue
            return (
              transaction.clientName.toLowerCase().includes(searchLower) ||
              (transaction as CompanyRevenue).service.toLowerCase().includes(searchLower)
            );
          } else {
            // CompanyExpense ou PersonalExpense
            return (
              transaction.name.toLowerCase().includes(searchLower) ||
              ('observation' in transaction && 
                transaction.observation?.toLowerCase().includes(searchLower))
            );
          }
        });
      }

      // Filtro de data inicial
      if (filters.dateFrom) {
        filtered = filtered.filter((transaction) => {
          const transactionDate = new Date(transaction.paymentDate);
          return transactionDate >= filters.dateFrom!;
        });
      }

      // Filtro de data final
      if (filters.dateTo) {
        filtered = filtered.filter((transaction) => {
          const transactionDate = new Date(transaction.paymentDate);
          return transactionDate <= filters.dateTo!;
        });
      }

      // Filtro de método de pagamento (apenas para receitas e despesas empresariais)
      if (filters.paymentMethod && filtered.length > 0 && 'paymentMethod' in filtered[0]) {
        filtered = filtered.filter((transaction) => {
          return (transaction as CompanyRevenue | CompanyExpense).paymentMethod === filters.paymentMethod;
        });
      }

      // Ordenação
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (filters.sortBy) {
          case 'date':
            comparison = new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
            break;
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'name':
            const nameA = 'clientName' in a ? a.clientName : a.name;
            const nameB = 'clientName' in b ? b.clientName : b.name;
            comparison = nameA.localeCompare(nameB);
            break;
          default:
            comparison = 0;
        }
        
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });

      return filtered;
    };
  }, [filters]);

  return {
    filters,
    filterTransactions,
    updateFilter,
    clearFilters
  };
};
