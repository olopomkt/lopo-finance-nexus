
import { format, parse, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dateTransformers = {
  // Converte Date para string no formato do Supabase (YYYY-MM-DD)
  toSupabase: (date: Date | string): string => {
    try {
      if (!date) {
        console.warn('Date is null or undefined, using current date');
        return format(new Date(), 'yyyy-MM-dd');
      }
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (!isValid(dateObj)) {
        console.warn('Invalid date provided, using current date:', date);
        return format(new Date(), 'yyyy-MM-dd');
      }
      
      return format(dateObj, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error converting date to Supabase format:', error, date);
      return format(new Date(), 'yyyy-MM-dd');
    }
  },

  // Converte string do Supabase para Date
  fromSupabase: (dateString: string | null): Date => {
    try {
      if (!dateString) {
        console.warn('Date string is null or undefined, using current date');
        return new Date();
      }
      
      // Tenta fazer parse da string
      const parsedDate = new Date(dateString);
      
      if (!isValid(parsedDate)) {
        console.warn('Invalid date string from Supabase, using current date:', dateString);
        return new Date();
      }
      
      return parsedDate;
    } catch (error) {
      console.error('Error parsing date from Supabase:', error, dateString);
      return new Date();
    }
  },

  // Formata data para exibição
  formatForDisplay: (date: Date | string, formatStr: string = 'dd/MM/yyyy'): string => {
    try {
      if (!date) {
        return 'Data não informada';
      }
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (!isValid(dateObj)) {
        return 'Data inválida';
      }
      
      return format(dateObj, formatStr, { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date for display:', error, date);
      return 'Erro na data';
    }
  },

  // Formata data para o calendário (componente de seleção de data)
  formatCalendar: (date: Date | string | null): string => {
    try {
      if (!date) {
        return 'Selecione uma data';
      }
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      if (!isValid(dateObj)) {
        return 'Data inválida';
      }
      
      return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date for calendar:', error, date);
      return 'Erro na data';
    }
  },

  // Converte input de formulário para Date
  fromFormInput: (dateString: string): Date => {
    try {
      if (!dateString) {
        return new Date();
      }
      
      // Tenta vários formatos
      const formats = ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy'];
      
      for (const fmt of formats) {
        try {
          const parsed = parse(dateString, fmt, new Date());
          if (isValid(parsed)) {
            return parsed;
          }
        } catch (e) {
          continue;
        }
      }
      
      // Se nenhum formato funcionou, tenta com new Date()
      const fallback = new Date(dateString);
      if (isValid(fallback)) {
        return fallback;
      }
      
      console.warn('Could not parse date string, using current date:', dateString);
      return new Date();
    } catch (error) {
      console.error('Error parsing form input date:', error, dateString);
      return new Date();
    }
  },

  // Verifica se uma data é válida
  isValidDate: (date: any): boolean => {
    try {
      if (!date) return false;
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return isValid(dateObj);
    } catch {
      return false;
    }
  },

  // Obtém o início do mês para uma data
  getMonthStart: (date: Date = new Date()): Date => {
    try {
      if (!isValid(date)) {
        date = new Date();
      }
      return new Date(date.getFullYear(), date.getMonth(), 1);
    } catch (error) {
      console.error('Error getting month start:', error);
      return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    }
  },

  // Obtém o fim do mês para uma data
  getMonthEnd: (date: Date = new Date()): Date => {
    try {
      if (!isValid(date)) {
        date = new Date();
      }
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    } catch (error) {
      console.error('Error getting month end:', error);
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }
  }
};

// Funções auxiliares para trabalhar com datas
export const formatCurrency = (value: number): string => {
  try {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value || 0);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `R$ ${(value || 0).toFixed(2)}`;
  }
};

export const formatDate = (date: Date | string | null, formatStr: string = 'dd/MM/yyyy'): string => {
  return dateTransformers.formatForDisplay(date || new Date(), formatStr);
};
