
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
    const transformedData = {
      ...data,
      paymentDate: data.paymentDate ? dateTransformers.toSupabase(data.paymentDate) : undefined,
      receivedDate: data.receivedDate ? dateTransformers.toSupabase(data.receivedDate) : undefined
    };
    return supabaseHook.updateRevenue(id, transformedData);
  };

  const saveCompanyExpense = async (data: CompanyExpenseFormData) => {
    const transformedData = {
      ...data,
      paymentDate: dateTransformers.toSupabase(data.paymentDate)
    };
    return supabaseHook.saveCompanyExpense(transformedData);
  };

  const updateCompanyExpense = async (id: string, data: Partial<CompanyExpenseFormData>) => {
    const transformedData = {
      ...data,
      paymentDate: data.paymentDate ? dateTransformers.toSupabase(data.paymentDate) : undefined
    };
    return supabaseHook.updateCompanyExpense(id, transformedData);
  };

  const savePersonalExpense = async (data: PersonalExpenseFormData) => {
    const transformedData = {
      ...data,
      paymentDate: dateTransformers.toSupabase(data.paymentDate)
    };
    return supabaseHook.savePersonalExpense(transformedData);
  };

  const updatePersonalExpense = async (id: string, data: Partial<PersonalExpenseFormData>) => {
    const transformedData = {
      ...data,
      paymentDate: data.paymentDate ? dateTransformers.toSupabase(data.paymentDate) : undefined
    };
    return supabaseHook.updatePersonalExpense(id, transformedData);
  };

  // Transformar dados recebidos do Supabase
  const companyRevenues = supabaseHook.companyRevenues.map(revenue => ({
    ...revenue,
    paymentDate: dateTransformers.fromSupabase(revenue.paymentDate),
    receivedDate: revenue.receivedDate ? dateTransformers.fromSupabase(revenue.receivedDate) : undefined,
    createdAt: new Date(revenue.createdAt)
  }));

  const companyExpenses = supabaseHook.companyExpenses.map(expense => ({
    ...expense,
    paymentDate: dateTransformers.fromSupabase(expense.paymentDate),
    paidDate: expense.paidDate ? dateTransformers.fromSupabase(expense.paidDate) : undefined,
    createdAt: new Date(expense.createdAt)
  }));

  const personalExpenses = supabaseHook.personalExpenses.map(expense => ({
    ...expense,
    paymentDate: dateTransformers.fromSupabase(expense.paymentDate),
    paidDate: expense.paidDate ? dateTransformers.fromSupabase(expense.paidDate) : undefined,
    createdAt: new Date(expense.createdAt)
  }));

  return {
    // Dados transformados
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
    
    // Outras ações do hook original
    confirmReceived: supabaseHook.confirmReceived,
    confirmPayment: supabaseHook.confirmPayment,
    isLoading: supabaseHook.isLoading,
    error: supabaseHook.error
  };
};
