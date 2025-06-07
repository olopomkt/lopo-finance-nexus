
import { useMemo } from 'react';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { useFilters } from './useFilters';

export const useTransactionFilters = () => {
  const filtersHook = useFilters();

  const filterTransactions = useMemo(() => {
    return <T extends CompanyRevenue | CompanyExpense | PersonalExpense>(
      transactions: T[],
      type: 'revenue' | 'expense'
    ): T[] => {
      let filtered = [...transactions];

      // Filtro de busca por texto
      if (filtersHook.filters.searchTerm) {
        const searchLower = filtersHook.filters.searchTerm.toLowerCase();
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
      if (filtersHook.filters.dateFrom) {
        filtered = filtered.filter((transaction) => {
          const transactionDate = new Date(transaction.paymentDate);
          return transactionDate >= filtersHook.filters.dateFrom!;
        });
      }

      // Filtro de data final
      if (filtersHook.filters.dateTo) {
        filtered = filtered.filter((transaction) => {
          const transactionDate = new Date(transaction.paymentDate);
          return transactionDate <= filtersHook.filters.dateTo!;
        });
      }

      // Filtro de método de pagamento (apenas para receitas e despesas empresariais)
      if (filtersHook.filters.paymentMethod && filtered.length > 0 && 'paymentMethod' in filtered[0]) {
        filtered = filtered.filter((transaction) => {
          return (transaction as CompanyRevenue | CompanyExpense).paymentMethod === filtersHook.filters.paymentMethod;
        });
      }

      // Ordenação
      filtered.sort((a, b) => {
        let comparison = 0;
        
        switch (filtersHook.filters.sortBy) {
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
        
        return filtersHook.filters.sortOrder === 'desc' ? -comparison : comparison;
      });

      return filtered;
    };
  }, [filtersHook.filters]);

  return {
    filters: filtersHook.filters,
    filterTransactions,
    setFilter: filtersHook.updateFilter,
    clearFilters: filtersHook.clearFilters
  };
};
