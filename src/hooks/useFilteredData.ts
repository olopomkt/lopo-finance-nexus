
import { useMemo } from 'react';
import { useGlobalFilters } from '@/contexts/FilterContext';
import { CombinedEntry } from '@/types';

// Função auxiliar para garantir que o objeto de data é válido
const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());

export function useFilteredData(data: CombinedEntry[] | undefined | null) {
  const { filters } = useGlobalFilters();

  const filteredData = useMemo(() => {
    // Etapa de segurança 1: Garantir que temos um array para trabalhar
    if (!Array.isArray(data)) {
      return [];
    }

    let items = [...data];

    // Filtragem por tipo (receita/despesa)
    if (filters.type && filters.type !== 'all') {
      items = items.filter(item => {
        if (filters.type === 'revenue') return 'description' in item;
        if (filters.type === 'expense') return 'category' in item;
        return true;
      });
    }

    // Filtragem por categoria de despesa
    if (filters.category && filters.category !== 'all') {
      items = items.filter(item => 'category' in item && item.category === filters.category);
    }

    // Filtragem por período (mês/ano)
    if (filters.period) {
      try {
        const [year, month] = filters.period.split('-').map(Number);
        items = items.filter(item => {
          if (!item.date) return false;
          const itemDate = new Date(item.date);
          return isValidDate(itemDate) && itemDate.getFullYear() === year && itemDate.getMonth() + 1 === month;
        });
      } catch (e) {
        console.error("Erro ao filtrar por período:", e);
        // Se o período for inválido, não filtramos para não quebrar a UI
      }
    }
    
    // Filtragem por palavra-chave
    if (filters.keyword && filters.keyword.trim() !== '') {
        const lowercasedKeyword = filters.keyword.toLowerCase();
        items = items.filter(item => {
            const description = 'description' in item ? item.description : '';
            const details = 'details' in item ? item.details : '';
            return (description && description.toLowerCase().includes(lowercasedKeyword)) ||
                   (details && details.toLowerCase().includes(lowercasedKeyword));
        });
    }

    // Etapa de segurança 2: Ordenação de data à prova de falhas
    items.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        
        // Se as datas forem inválidas, não tente ordenar para evitar erros
        if (isNaN(dateA) || isNaN(dateB)) {
            return 0;
        }
        
        return dateB - dateA; // Do mais recente para o mais antigo
    });

    return items;
  }, [data, filters]);

  return filteredData;
}
