
import { useMemo } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { dateTransformers } from '@/lib/dateUtils';
import { CompanyRevenueFormData, CompanyExpenseFormData, PersonalExpenseFormData } from '@/types/finance';

// Função de segurança para validar datas
const isValidDate = (d: any): boolean => d instanceof Date && !isNaN(d.getTime());

export const useFinanceData = () => {
  const supabaseHook = useSupabaseData();

  // Dados saneados e combinados
  const sanitizedData = useMemo(() => {
    const allRevenues = Array.isArray(supabaseHook.companyRevenues) ? supabaseHook.companyRevenues : [];
    const allCompanyExpenses = Array.isArray(supabaseHook.companyExpenses) ? supabaseHook.companyExpenses : [];  
    const allPersonalExpenses = Array.isArray(supabaseHook.personalExpenses) ? supabaseHook.personalExpenses : [];

    // Sanear receitas
    const sanitizedRevenues = allRevenues
      .map(item => ({
        ...item,
        paymentDate: item.paymentDate ? new Date(item.paymentDate) : null,
        receivedDate: item.receivedDate ? new Date(item.receivedDate) : null
      }))
      .filter(item => {
        if (item.paymentDate && isValidDate(item.paymentDate)) {
          return true;
        }
        console.warn('Receita descartada por data inválida:', item);
        return false;
      });

    // Sanear despesas empresariais
    const sanitizedCompanyExpenses = allCompanyExpenses
      .map(item => ({
        ...item,
        paymentDate: item.paymentDate ? new Date(item.paymentDate) : null,
        paidDate: item.paidDate ? new Date(item.paidDate) : null
      }))
      .filter(item => {
        if (item.paymentDate && isValidDate(item.paymentDate)) {
          return true;
        }
        console.warn('Despesa empresarial descartada por data inválida:', item);
        return false;
      });

    // Sanear despesas pessoais
    const sanitizedPersonalExpenses = allPersonalExpenses
      .map(item => ({
        ...item,
        paymentDate: item.paymentDate ? new Date(item.paymentDate) : null,
        paidDate: item.paidDate ? new Date(item.paidDate) : null
      }))
      .filter(item => {
        if (item.paymentDate && isValidDate(item.paymentDate)) {
          return true;
        }
        console.warn('Despesa pessoal descartada por data inválida:', item);
        return false;
      });

    // Ordenar cada categoria por data
    sanitizedRevenues.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());
    sanitizedCompanyExpenses.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());
    sanitizedPersonalExpenses.sort((a, b) => b.paymentDate.getTime() - a.paymentDate.getTime());

    return {
      companyRevenues: sanitizedRevenues,
      companyExpenses: sanitizedCompanyExpenses,
      personalExpenses: sanitizedPersonalExpenses
    };
  }, [supabaseHook.companyRevenues, supabaseHook.companyExpenses, supabaseHook.personalExpenses]);

  // Wrapper functions que aplicam transformações de data apenas para dados de formulário
  const saveRevenue = async (data: CompanyRevenueFormData) => {
    try {
      const transformedData = {
        ...data,
        paymentDate: dateTransformers.toSupabase(data.paymentDate),
        receivedDate: data.receivedDate ? dateTransformers.toSupabase(data.receivedDate) : undefined
      };
      console.log('Transformed revenue data:', transformedData);
      return await supabaseHook.saveRevenue(transformedData);
    } catch (error) {
      console.error('Error in saveRevenue wrapper:', error);
      throw error;
    }
  };

  const updateRevenue = async (id: string, data: Partial<CompanyRevenueFormData>) => {
    try {
      const transformedData: any = { ...data };
      if (data.paymentDate) {
        transformedData.paymentDate = dateTransformers.toSupabase(data.paymentDate);
      }
      if (data.receivedDate) {
        transformedData.receivedDate = dateTransformers.toSupabase(data.receivedDate);
      }
      console.log('Transformed update revenue data:', transformedData);
      return await supabaseHook.updateRevenue(id, transformedData);
    } catch (error) {
      console.error('Error in updateRevenue wrapper:', error);
      throw error;
    }
  };

  const saveCompanyExpense = async (data: CompanyExpenseFormData) => {
    try {
      const transformedData = {
        ...data,
        paymentDate: dateTransformers.toSupabase(data.paymentDate),
        paid: false
      };
      console.log('Transformed company expense data:', transformedData);
      return await supabaseHook.saveCompanyExpense(transformedData);
    } catch (error) {
      console.error('Error in saveCompanyExpense wrapper:', error);
      throw error;
    }
  };

  const updateCompanyExpense = async (id: string, data: Partial<CompanyExpenseFormData>) => {
    try {
      const transformedData: any = { ...data };
      if (data.paymentDate) {
        transformedData.paymentDate = dateTransformers.toSupabase(data.paymentDate);
      }
      console.log('Transformed update company expense data:', transformedData);
      return await supabaseHook.updateCompanyExpense(id, transformedData);
    } catch (error) {
      console.error('Error in updateCompanyExpense wrapper:', error);
      throw error;
    }
  };

  const savePersonalExpense = async (data: PersonalExpenseFormData) => {
    try {
      const transformedData = {
        ...data,
        paymentDate: dateTransformers.toSupabase(data.paymentDate),
        paid: false
      };
      console.log('Transformed personal expense data:', transformedData);
      return await supabaseHook.savePersonalExpense(transformedData);
    } catch (error) {
      console.error('Error in savePersonalExpense wrapper:', error);
      throw error;
    }
  };

  const updatePersonalExpense = async (id: string, data: Partial<PersonalExpenseFormData>) => {
    try {
      const transformedData: any = { ...data };
      if (data.paymentDate) {
        transformedData.paymentDate = dateTransformers.toSupabase(data.paymentDate);
      }
      console.log('Transformed update personal expense data:', transformedData);
      return await supabaseHook.updatePersonalExpense(id, transformedData);
    } catch (error) {
      console.error('Error in updatePersonalExpense wrapper:', error);
      throw error;
    }
  };

  // Simplified confirmation functions - delegate directly to supabase hook
  const confirmReceived = async (id: string, receivedDate: Date = new Date()) => {
    try {
      await supabaseHook.confirmReceived(id, receivedDate);
    } catch (error) {
      console.error('Error in confirmReceived:', error);
      throw error;
    }
  };

  const confirmPayment = async (id: string, type: 'company' | 'personal', paidDate: Date = new Date()) => {
    try {
      await supabaseHook.confirmPayment(id, type, paidDate);
    } catch (error) {
      console.error('Error in confirmPayment:', error);
      throw error;
    }
  };

  return {
    // Dados saneados e seguros
    companyRevenues: sanitizedData.companyRevenues,
    companyExpenses: sanitizedData.companyExpenses,
    personalExpenses: sanitizedData.personalExpenses,
    
    // Estados
    isLoading: supabaseHook.isLoading,
    error: supabaseHook.error,
    isConnected: supabaseHook.isConnected,
    
    // Ações de formulário com transformação de data
    saveRevenue,
    updateRevenue,
    saveCompanyExpense,
    updateCompanyExpense,
    savePersonalExpense,
    updatePersonalExpense,
    
    // Delegate delete operations directly to supabase hook
    deleteRevenue: supabaseHook.deleteRevenue,
    deleteCompanyExpense: supabaseHook.deleteCompanyExpense,
    deletePersonalExpense: supabaseHook.deletePersonalExpense,
    
    // Simplified confirmation actions
    confirmReceived,
    confirmPayment,
    
    // Utilidades
    fetchAllData: supabaseHook.fetchAllData
  };
};
