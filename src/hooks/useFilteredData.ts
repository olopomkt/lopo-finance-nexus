
// src/hooks/useFilteredData.ts (Versão Final Unificada - Compatibilidade Mantida)
import { useMemo } from 'react';
import { useGlobalFilters } from '@/contexts/FilterContext';
import { CombinedEntry, CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';

// Função principal para dados combinados (nova interface)
export function useFilteredCombinedData(data: CombinedEntry[]) {
  const { filters } = useGlobalFilters();

  return useMemo(() => {
    if (!Array.isArray(data)) return [];

    let items = [...data];

    if (filters.searchTerm && filters.searchTerm.trim() !== '' && 
        filters.searchTerm !== 'all' && filters.searchTerm !== 'revenue' && filters.searchTerm !== 'expense') {
      const lowercasedKeyword = filters.searchTerm.toLowerCase();
      items = items.filter(item => {
        const description = item.description?.toLowerCase() || '';
        const details = item.details?.toLowerCase() || '';
        const client = item.client?.toLowerCase() || '';
        return description.includes(lowercasedKeyword) ||
               details.includes(lowercasedKeyword) ||
               client.includes(lowercasedKeyword);
      });
    }

    // Apply type filter using searchTerm
    if (filters.searchTerm === 'revenue') {
      items = items.filter(item => item.type === 'revenue');
    } else if (filters.searchTerm === 'expense') {
      items = items.filter(item => item.type === 'company_expense' || item.type === 'personal_expense');
    }

    // Apply payment method filter
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      items = items.filter(item => {
        if ('paymentMethod' in item) {
          return (item as any).paymentMethod === filters.paymentMethod;
        }
        return true;
      });
    }

    // Apply date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      items = items.filter(item => {
        const itemDate = item.date;
        if (filters.dateRange?.start && itemDate < filters.dateRange.start) return false;
        if (filters.dateRange?.end && itemDate > filters.dateRange.end) return false;
        return true;
      });
    }

    // Apply sorting
    if (filters.sortBy && filters.sortOrder) {
      items.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = a.date;
            bValue = b.date;
            break;
          case 'price':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'name':
            aValue = a.description || '';
            bValue = b.description || '';
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return items;
  }, [data, filters]);
}

// Função para compatibilidade com componentes existentes (interface antiga mantida)
export function useFilteredData(data: {
  companyRevenues: CompanyRevenue[];
  companyExpenses: CompanyExpense[];
  personalExpenses: PersonalExpense[];
}) {
  const { filters } = useGlobalFilters();

  const { filteredRevenues, filteredCompanyExpenses, filteredPersonalExpenses } = useMemo(() => {
    let revenues = [...(data.companyRevenues || [])];
    let companyExpenses = [...(data.companyExpenses || [])];
    let personalExpenses = [...(data.personalExpenses || [])];

    // Apply search term filter
    if (filters.searchTerm && filters.searchTerm.trim() !== '' && 
        filters.searchTerm !== 'all' && filters.searchTerm !== 'revenue' && filters.searchTerm !== 'expense') {
      const lowercasedKeyword = filters.searchTerm.toLowerCase();
      
      revenues = revenues.filter(item => {
        const description = item.service?.toLowerCase() || '';
        const client = item.clientName?.toLowerCase() || '';
        return description.includes(lowercasedKeyword) || client.includes(lowercasedKeyword);
      });

      companyExpenses = companyExpenses.filter(item => {
        const description = item.name?.toLowerCase() || '';
        return description.includes(lowercasedKeyword);
      });

      personalExpenses = personalExpenses.filter(item => {
        const description = item.name?.toLowerCase() || '';
        const details = item.observation?.toLowerCase() || '';
        return description.includes(lowercasedKeyword) || details.includes(lowercasedKeyword);
      });
    }

    // Apply type filter using searchTerm
    if (filters.searchTerm === 'revenue') {
      companyExpenses = [];
      personalExpenses = [];
    } else if (filters.searchTerm === 'expense') {
      revenues = [];
    }

    // Apply payment method filter
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      revenues = revenues.filter(item => item.paymentMethod === filters.paymentMethod);
      companyExpenses = companyExpenses.filter(item => item.paymentMethod === filters.paymentMethod);
    }

    // Apply date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const filterByDate = (items: any[]) => items.filter(item => {
        const itemDate = new Date(item.paymentDate);
        if (filters.dateRange?.start && itemDate < filters.dateRange.start) return false;
        if (filters.dateRange?.end && itemDate > filters.dateRange.end) return false;
        return true;
      });

      revenues = filterByDate(revenues);
      companyExpenses = filterByDate(companyExpenses);
      personalExpenses = filterByDate(personalExpenses);
    }

    // Apply sorting
    if (filters.sortBy && filters.sortOrder) {
      const sortFunction = (a: any, b: any) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = new Date(a.paymentDate);
            bValue = new Date(b.paymentDate);
            break;
          case 'price':
            aValue = a.price;
            bValue = b.price;
            break;
          case 'name':
            aValue = a.clientName || a.name || '';
            bValue = b.clientName || b.name || '';
            break;
          default:
            return 0;
        }

        if (filters.sortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      };

      revenues.sort(sortFunction);
      companyExpenses.sort(sortFunction);
      personalExpenses.sort(sortFunction);
    }

    return {
      filteredRevenues: revenues,
      filteredCompanyExpenses: companyExpenses,
      filteredPersonalExpenses: personalExpenses
    };
  }, [data, filters]);

  return { filteredRevenues, filteredCompanyExpenses, filteredPersonalExpenses };
}
