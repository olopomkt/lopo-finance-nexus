
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dateTransformers = {
  // Converte Date para string no formato ISO para o Supabase
  toSupabase: (date: Date): string => {
    return date.toISOString().split('T')[0];
  },

  // Converte string ISO do Supabase para Date
  fromSupabase: (dateString: string): Date => {
    return parseISO(dateString);
  },

  // Formata data para exibição
  formatDisplay: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  },

  // Formata data para o calendário
  formatCalendar: (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, "PPP", { locale: ptBR });
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
