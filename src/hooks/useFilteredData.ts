
import { useMemo } from 'react';
import { useGlobalFilters } from '@/contexts/FilterContext';
import { CombinedEntry } from '@/types';

export function useFilteredData(data: CombinedEntry[]) {
  const { filters } = useGlobalFilters();

  const filteredData = useMemo(() => {
    if (!data) return [];

    let items = [...data];

    // Filtrar por tipo
    if (filters.searchTerm && filters.searchTerm !== 'all') {
      // Using searchTerm as type filter since that's what exists in GlobalFilterState
      items = items.filter(item => {
        if (filters.searchTerm === 'revenue') return item.type === 'revenue';
        if (filters.searchTerm === 'expense') return item.type === 'company_expense' || item.type === 'personal_expense';
        return true;
      });
    }

    // Filtrar por método de pagamento
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      items = items.filter(item => {
        if ('paymentMethod' in item) {
          return item.paymentMethod === filters.paymentMethod;
        }
        return true;
      });
    }

    // Filtrar por período de data
    if (filters.dateRange?.from || filters.dateRange?.to) {
      items = items.filter(item => {
        const itemDate = item.date;
        if (filters.dateRange?.from && itemDate < filters.dateRange.from) return false;
        if (filters.dateRange?.to && itemDate > filters.dateRange.to) return false;
        return true;
      });
    }
    
    // Filtrar por palavra-chave (usando searchTerm para busca textual)
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

    // Aplicar ordenação se especificada
    if (filters.sortBy && filters.sortOrder) {
      items.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'date':
            aValue = a.date;
            bValue = b.date;
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'description':
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

  return filteredData;
}
