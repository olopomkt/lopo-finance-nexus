
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dateTransformers = {
  // Converte Date para string no formato ISO para o Supabase
  toSupabase: (date: Date): string => {
    if (!date || !(date instanceof Date)) {
      throw new Error('Data inválida para conversão');
    }
    return date.toISOString().split('T')[0];
  },

  // Converte string ISO do Supabase para Date
  fromSupabase: (dateString: string): Date => {
    if (!dateString) {
      throw new Error('String de data vazia');
    }
    try {
      return parseISO(dateString);
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return new Date();
    }
  },

  // Formata data para exibição
  formatDisplay: (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!dateObj || isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return 'Data inválida';
    }
  },

  // Formata data para o calendário
  formatCalendar: (date: Date | string): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!dateObj || isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      return format(dateObj, "PPP", { locale: ptBR });
    } catch (error) {
      console.error('Error formatting calendar date:', date, error);
      return 'Data inválida';
    }
  },

  // Valida se uma data é válida
  isValidDate: (date: any): date is Date => {
    return date instanceof Date && !isNaN(date.getTime());
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};
