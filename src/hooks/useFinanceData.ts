
import { useSupabaseData } from './useSupabaseData';
import { dateTransformers } from '@/lib/dateUtils';
import { CompanyRevenueFormData, CompanyExpenseFormData, PersonalExpenseFormData } from '@/types/finance';

export const useFinanceData = () => {
  const supabaseHook = useSupabaseData();

  // Wrapper functions que aplicam transformações de data
  const saveRevenue = async (data: CompanyRevenueFormData) => {
    const transformedData = {
      ...data,
      paymentDate: dateTransformers.toSupabase(data.paymentDate),
      receivedDate: data.receivedDate ? dateTransformers.toSupabase(data.receivedDate) : undefined
    };
    return supabaseHook.saveRevenue(transformedData);
  };

  const updateRevenue = async (id: string, data: Partial<CompanyRevenueFormData>) => {
    const transformedData: any = { ...data };
    if (data.paymentDate) {
      transformedData.paymentDate = dateTransformers.toSupabase(data.paymentDate);
    }
    if (data.receivedDate) {
      transformedData.receivedDate = dateTransformers.toSupabase(data.receivedDate);
    }
    return supabaseHook.updateRevenue(id, transformedData);
  };

  const saveCompanyExpense = async (data: CompanyExpenseFormData) => {
    const transformedData = {
      ...data,
      paymentDate: dateTransformers.toSupabase(data.paymentDate),
      paid: false
    };
    return supabaseHook.saveCompanyExpense(transformedData);
  };

  const updateCompanyExpense = async (id: string, data: Partial<CompanyExpenseFormData>) => {
    const transformedData: any = { ...data };
    if (data.paymentDate) {
      transformedData.paymentDate = dateTransformers.toSupabase(data.paymentDate);
    }
    return supabaseHook.updateCompanyExpense(id, transformedData);
  };

  const savePersonalExpense = async (data: PersonalExpenseFormData) => {
    const transformedData = {
      ...data,
      paymentDate: dateTransformers.toSupabase(data.paymentDate),
      paid: false
    };
    return supabaseHook.savePersonalExpense(transformedData);
  };

  const updatePersonalExpense = async (id: string, data: Partial<PersonalExpenseFormData>) => {
    const transformedData: any = { ...data };
    if (data.paymentDate) {
      transformedData.paymentDate = dateTransformers.toSupabase(data.paymentDate);
    }
    return supabaseHook.updatePersonalExpense(id, transformedData);
  };

  // Transformar dados recebidos do Supabase - já vêm transformados do useSupabaseData
  const companyRevenues = supabaseHook.companyRevenues;
  const companyExpenses = supabaseHook.companyExpenses;
  const personalExpenses = supabaseHook.personalExpenses;

  // Funções de confirmação com transformação correta
  const confirmReceived = async (id: string, receivedDate: Date = new Date()) => {
    await updateRevenue(id, { received: true, receivedDate });
  };

  const confirmPayment = async (id: string, type: 'company' | 'personal', paidDate: Date = new Date()) => {
    if (type === 'company') {
      const transformedData = {
        paid: true,
        paidDate: dateTransformers.toSupabase(paidDate)
      };
      await supabaseHook.updateCompanyExpense(id, transformedData);
    } else {
      const transformedData = {
        paid: true,
        paidDate: dateTransformers.toSupabase(paidDate)
      };
      await supabaseHook.updatePersonalExpense(id, transformedData);
    }
  };

  return {
    // Dados já transformados
    companyRevenues,
    companyExpenses,
    personalExpenses,
    
    // Ações com transformação de data
    saveRevenue,
    updateRevenue,
    saveCompanyExpense,
    updateCompanyExpense,
    savePersonalExpense,
    updatePersonalExpense,
    
    // Funções delete (expostas do hook supabase)
    deleteRevenue: supabaseHook.deleteRevenue,
    deleteCompanyExpense: supabaseHook.deleteCompanyExpense,
    deletePersonalExpense: supabaseHook.deletePersonalExpense,
    
    // Outras ações
    confirmReceived,
    confirmPayment,
    isLoading: supabaseHook.isLoading,
    error: supabaseHook.error
  };
};
