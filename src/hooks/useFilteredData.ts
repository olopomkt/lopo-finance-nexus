
import { useMemo } from 'react';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { useGlobalFilters } from '@/contexts/FilterContext';

type TransactionType = CompanyRevenue | CompanyExpense | PersonalExpense;

interface UseFilteredDataProps {
  companyRevenues: CompanyRevenue[];
  companyExpenses: CompanyExpense[];
  personalExpenses: PersonalExpense[];
}

export const useFilteredData = ({
  companyRevenues,
  companyExpenses,
  personalExpenses
}: UseFilteredDataProps) => {
  const { filters } = useGlobalFilters();

  const filterTransactions = useMemo(() => {
    return <T extends TransactionType>(transactions: T[]): T[] => {
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
      if (filters.dateRange.start) {
        filtered = filtered.filter((transaction) => {
          const transactionDate = new Date(transaction.paymentDate);
          return transactionDate >= filters.dateRange.start!;
        });
      }

      // Filtro de data final
      if (filters.dateRange.end) {
        filtered = filtered.filter((transaction) => {
          const transactionDate = new Date(transaction.paymentDate);
          return transactionDate <= filters.dateRange.end!;
        });
      }

      // Filtro de método de pagamento
      if (filters.paymentMethod !== 'all' && filtered.length > 0 && 'paymentMethod' in filtered[0]) {
        filtered = filtered.filter((transaction) => {
          return (transaction as CompanyRevenue | CompanyExpense).paymentMethod === filters.paymentMethod;
        });
      }

      // Filtro de tipo de contrato (apenas receitas)
      if (filters.contractType !== 'all' && filtered.length > 0 && 'contractType' in filtered[0]) {
        filtered = filtered.filter((transaction) => {
          return (transaction as CompanyRevenue).contractType === filters.contractType;
        });
      }

      // Filtro de tipo de despesa (apenas despesas empresariais)
      if (filters.expenseType !== 'all' && filtered.length > 0 && 'type' in filtered[0]) {
        filtered = filtered.filter((transaction) => {
          return (transaction as CompanyExpense).type === filters.expenseType;
        });
      }

      // Filtro de tipo de conta (apenas receitas)
      if (filters.accountType !== 'all' && filtered.length > 0 && 'accountType' in filtered[0]) {
        filtered = filtered.filter((transaction) => {
          return (transaction as CompanyRevenue).accountType === filters.accountType;
        });
      }

      // Filtro de status
      if (filters.status !== 'all') {
        filtered = filtered.filter((transaction) => {
          if ('received' in transaction) {
            // CompanyRevenue
            const revenue = transaction as CompanyRevenue;
            if (filters.status === 'received') return revenue.received;
            if (filters.status === 'pending') return !revenue.received;
          } else if ('paid' in transaction) {
            // CompanyExpense ou PersonalExpense
            const expense = transaction as CompanyExpense | PersonalExpense;
            if (filters.status === 'paid') return expense.paid;
            if (filters.status === 'unpaid') return !expense.paid;
          }
          return true;
        });
      }

      // Filtro de range de preço
      if (filters.priceRange.min !== null) {
        filtered = filtered.filter((transaction) => transaction.price >= filters.priceRange.min!);
      }

      if (filters.priceRange.max !== null) {
        filtered = filtered.filter((transaction) => transaction.price <= filters.priceRange.max!);
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

  const filteredRevenues = useMemo(() => 
    filterTransactions(companyRevenues), 
    [companyRevenues, filterTransactions]
  );
  
  const filteredCompanyExpenses = useMemo(() => 
    filterTransactions(companyExpenses), 
    [companyExpenses, filterTransactions]
  );
  
  const filteredPersonalExpenses = useMemo(() => 
    filterTransactions(personalExpenses), 
    [personalExpenses, filterTransactions]
  );

  return {
    filteredRevenues,
    filteredCompanyExpenses,
    filteredPersonalExpenses
  };
};
