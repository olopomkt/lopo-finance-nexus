
import { useMemo } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { CompanyRevenue, CompanyExpense, PersonalExpense, CombinedEntry } from '@/types';

// Função de segurança para validar datas
const isValidDate = (d: any): boolean => d instanceof Date && !isNaN(d.getTime());

export function useFinanceData() {
  const { data: revenues, isLoading: isLoadingRevenues, error: errorRevenues, saveCompanyRevenue, updateCompanyRevenue, deleteCompanyRevenue } = useSupabaseData<CompanyRevenue>('company_revenues');
  const { data: companyExpenses, isLoading: isLoadingCompanyExpenses, error: errorCompanyExpenses, saveCompanyExpense, updateCompanyExpense, deleteCompanyExpense } = useSupabaseData<CompanyExpense>('company_expenses');
  const { data: personalExpenses, isLoading: isLoadingPersonalExpenses, error: errorPersonalExpenses, savePersonalExpense, updatePersonalExpense, deletePersonalExpense } = useSupabaseData<PersonalExpense>('personal_expenses');

  const combinedData = useMemo(() => {
    const revenueEntries: CombinedEntry[] = (revenues || []).map(item => ({
      ...item,
      type: 'revenue' as const,
      date: item.paymentDate ? new Date(item.paymentDate) : new Date(),
      client: item.clientName,
      description: item.service,
      amount: item.price
    }));

    const companyExpenseEntries: CombinedEntry[] = (companyExpenses || []).map(item => ({
      ...item,
      type: 'company_expense' as const,
      date: item.paymentDate ? new Date(item.paymentDate) : new Date(),
      description: item.name,
      amount: item.price,
      category: item.type
    }));

    const personalExpenseEntries: CombinedEntry[] = (personalExpenses || []).map(item => ({
      ...item,
      type: 'personal_expense' as const,
      date: item.paymentDate ? new Date(item.paymentDate) : new Date(),
      description: item.name,
      amount: item.price,
      details: item.observation
    }));

    const allData = [
      ...revenueEntries,
      ...companyExpenseEntries,
      ...personalExpenseEntries
    ];

    // Etapa de Saneamento: Garantir que cada item tenha uma data válida
    const sanitizedData = allData.filter(item => {
      if (item.date && isValidDate(item.date)) {
        return true;
      }
      console.warn('Registro descartado por data inválida:', item);
      return false;
    });
      
    // Ordena uma vez, aqui na fonte
    sanitizedData.sort((a, b) => b.date.getTime() - a.date.getTime());

    return sanitizedData;
  }, [revenues, companyExpenses, personalExpenses]);

  const isLoading = isLoadingRevenues || isLoadingCompanyExpenses || isLoadingPersonalExpenses;
  const error = errorRevenues || errorCompanyExpenses || errorPersonalExpenses;

  return { 
    combinedData, 
    isLoading, 
    error,
    // Expose individual CRUD operations
    saveCompanyRevenue,
    updateCompanyRevenue,
    deleteCompanyRevenue,
    saveCompanyExpense,
    updateCompanyExpense,
    deleteCompanyExpense,
    savePersonalExpense,
    updatePersonalExpense,
    deletePersonalExpense
  };
}
