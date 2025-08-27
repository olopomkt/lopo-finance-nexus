
import { useMemo } from 'react';
import { useGlobalFilters } from '@/contexts/FilterContext';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';

// Função auxiliar para garantir que o objeto de data é válido
const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());

interface FilteredDataInput {
  companyRevenues: CompanyRevenue[];
  companyExpenses: CompanyExpense[];
  personalExpenses: PersonalExpense[];
}

export function useFilteredData({ companyRevenues, companyExpenses, personalExpenses }: FilteredDataInput) {
  const { filters } = useGlobalFilters();

  const filteredData = useMemo(() => {
    // Garantir que temos arrays para trabalhar
    const revenues = Array.isArray(companyRevenues) ? [...companyRevenues] : [];
    const compExpenses = Array.isArray(companyExpenses) ? [...companyExpenses] : [];
    const persExpenses = Array.isArray(personalExpenses) ? [...personalExpenses] : [];

    let filteredRevenues = revenues;
    let filteredCompanyExpenses = compExpenses;
    let filteredPersonalExpenses = persExpenses;

    // Filtragem por termo de busca
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      const lowercasedTerm = filters.searchTerm.toLowerCase();
      
      filteredRevenues = filteredRevenues.filter(item => 
        item.clientName?.toLowerCase().includes(lowercasedTerm) ||
        item.service?.toLowerCase().includes(lowercasedTerm)
      );
      
      filteredCompanyExpenses = filteredCompanyExpenses.filter(item => 
        item.name?.toLowerCase().includes(lowercasedTerm)
      );
      
      filteredPersonalExpenses = filteredPersonalExpenses.filter(item => 
        item.name?.toLowerCase().includes(lowercasedTerm) ||
        item.observation?.toLowerCase().includes(lowercasedTerm)
      );
    }

    // Filtragem por método de pagamento
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      filteredRevenues = filteredRevenues.filter(item => item.paymentMethod === filters.paymentMethod);
      filteredCompanyExpenses = filteredCompanyExpenses.filter(item => item.paymentMethod === filters.paymentMethod);
    }

    // Filtragem por tipo de contrato (apenas receitas)
    if (filters.contractType && filters.contractType !== 'all') {
      filteredRevenues = filteredRevenues.filter(item => item.contractType === filters.contractType);
    }

    // Filtragem por tipo de despesa (apenas despesas empresariais)
    if (filters.expenseType && filters.expenseType !== 'all') {
      filteredCompanyExpenses = filteredCompanyExpenses.filter(item => item.type === filters.expenseType);
    }

    // Filtragem por tipo de conta (apenas receitas)
    if (filters.accountType && filters.accountType !== 'all') {
      filteredRevenues = filteredRevenues.filter(item => item.accountType === filters.accountType);
    }

    // Filtragem por status
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'received') {
        filteredRevenues = filteredRevenues.filter(item => item.received);
      } else if (filters.status === 'pending') {
        filteredRevenues = filteredRevenues.filter(item => !item.received);
      } else if (filters.status === 'paid') {
        filteredCompanyExpenses = filteredCompanyExpenses.filter(item => item.paid);
        filteredPersonalExpenses = filteredPersonalExpenses.filter(item => item.paid);
      } else if (filters.status === 'unpaid') {
        filteredCompanyExpenses = filteredCompanyExpenses.filter(item => !item.paid);
        filteredPersonalExpenses = filteredPersonalExpenses.filter(item => !item.paid);
      }
    }

    // Filtragem por intervalo de datas
    if (filters.dateRange.start || filters.dateRange.end) {
      const filterByDateRange = (items: any[]) => {
        return items.filter(item => {
          if (!item.paymentDate) return false;
          const itemDate = new Date(item.paymentDate);
          if (!isValidDate(itemDate)) return false;
          
          if (filters.dateRange.start && itemDate < filters.dateRange.start) return false;
          if (filters.dateRange.end && itemDate > filters.dateRange.end) return false;
          
          return true;
        });
      };

      filteredRevenues = filterByDateRange(filteredRevenues);
      filteredCompanyExpenses = filterByDateRange(filteredCompanyExpenses);
      filteredPersonalExpenses = filterByDateRange(filteredPersonalExpenses);
    }

    // Filtragem por intervalo de preços
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) {
      const filterByPriceRange = (items: any[]) => {
        return items.filter(item => {
          if (filters.priceRange.min !== null && item.price < filters.priceRange.min) return false;
          if (filters.priceRange.max !== null && item.price > filters.priceRange.max) return false;
          return true;
        });
      };

      filteredRevenues = filterByPriceRange(filteredRevenues);
      filteredCompanyExpenses = filterByPriceRange(filteredCompanyExpenses);
      filteredPersonalExpenses = filterByPriceRange(filteredPersonalExpenses);
    }

    // Ordenação
    const sortFunction = (a: any, b: any) => {
      let valueA, valueB;

      switch (filters.sortBy) {
        case 'date':
          valueA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
          valueB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
          break;
        case 'price':
          valueA = a.price || 0;
          valueB = b.price || 0;
          break;
        case 'name':
          valueA = a.name || a.clientName || '';
          valueB = b.name || b.clientName || '';
          break;
        default:
          valueA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
          valueB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
      }

      if (filters.sortOrder === 'asc') {
        return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      }
    };

    filteredRevenues.sort(sortFunction);
    filteredCompanyExpenses.sort(sortFunction);
    filteredPersonalExpenses.sort(sortFunction);

    return {
      filteredRevenues,
      filteredCompanyExpenses,
      filteredPersonalExpenses
    };
  }, [companyRevenues, companyExpenses, personalExpenses, filters]);

  return filteredData;
}
