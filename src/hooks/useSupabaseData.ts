import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { toast } from '@/hooks/use-toast';
import { dateTransformers } from '@/lib/dateUtils';

export const useSupabaseData = () => {
  const [companyRevenues, setCompanyRevenues] = useState<CompanyRevenue[]>([]);
  const [companyExpenses, setCompanyExpenses] = useState<CompanyExpense[]>([]);
  const [personalExpenses, setPersonalExpenses] = useState<PersonalExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [revenuesResult, companyExpensesResult, personalExpensesResult] = await Promise.all([
        supabase
          .from('company_revenues')
          .select('*')
          .order('payment_date', { ascending: false }),
        supabase
          .from('company_expenses')
          .select('*')
          .order('payment_date', { ascending: false }),
        supabase
          .from('personal_expenses')
          .select('*')
          .order('payment_date', { ascending: false })
      ]);

      if (revenuesResult.error) {
        console.error('Error fetching revenues:', revenuesResult.error);
        throw revenuesResult.error;
      }
      if (companyExpensesResult.error) {
        console.error('Error fetching company expenses:', companyExpensesResult.error);
        throw companyExpensesResult.error;
      }
      if (personalExpensesResult.error) {
        console.error('Error fetching personal expenses:', personalExpensesResult.error);
        throw personalExpensesResult.error;
      }

      // Transform data with proper date conversion and null checks
      setCompanyRevenues(revenuesResult.data?.map(item => ({
        id: item.id,
        clientName: item.client_name || '',
        service: item.service || '',
        price: item.price || 0,
        paymentMethod: (item.payment_method || 'Pix') as 'Pix' | 'Cartão' | 'Outro',
        contractType: (item.contract_type || 'único') as 'único' | 'mensal',
        contractMonths: item.contract_months || null,
        paymentDate: dateTransformers.fromSupabase(item.payment_date),
        accountType: (item.account_type || 'Marlon Lopo') as 'Marlon Lopo' | 'Infinity B2B',
        received: item.received || false,
        receivedDate: item.received_date ? dateTransformers.fromSupabase(item.received_date) : undefined,
        createdAt: dateTransformers.fromSupabase(item.created_at)
      })) || []);

      setCompanyExpenses(companyExpensesResult.data?.map(item => ({
        id: item.id,
        name: item.name || '',
        price: item.price || 0,
        paymentMethod: (item.payment_method || 'Pix') as 'Pix' | 'Cartão' | 'Outro',
        type: (item.type || 'Único') as 'Assinatura' | 'Único',
        paymentDate: dateTransformers.fromSupabase(item.payment_date),
        paid: item.paid || false,
        paidDate: item.paid_date ? dateTransformers.fromSupabase(item.paid_date) : undefined,
        createdAt: dateTransformers.fromSupabase(item.created_at)
      })) || []);

      setPersonalExpenses(personalExpensesResult.data?.map(item => ({
        id: item.id,
        name: item.name || '',
        price: item.price || 0,
        paymentDate: dateTransformers.fromSupabase(item.payment_date),
        observation: item.observation || undefined,
        paid: item.paid || false,
        paidDate: item.paid_date ? dateTransformers.fromSupabase(item.paid_date) : undefined,
        createdAt: dateTransformers.fromSupabase(item.created_at)
      })) || []);

    } catch (err: any) {
      console.error('Error in fetchAllData:', err);
      setError(err.message || 'Erro desconhecido ao carregar dados');
      toast({
        title: "Erro ao carregar dados",
        description: err.message || 'Erro desconhecido',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save operations with better error handling
  const saveRevenue = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      console.log('Saving revenue data:', data);
      const { data: result, error } = await supabase
        .from('company_revenues')
        .insert({
          client_name: data.clientName,
          service: data.service,
          price: data.price,
          payment_method: data.paymentMethod,
          contract_type: data.contractType,
          contract_months: data.contractMonths,
          payment_date: data.paymentDate,
          account_type: data.accountType,
          received: data.received || false,
          received_date: data.receivedDate || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving revenue:', error);
        throw error;
      }
      
      const newRevenue: CompanyRevenue = {
        id: result.id,
        clientName: result.client_name,
        service: result.service,
        price: result.price,
        paymentMethod: result.payment_method as 'Pix' | 'Cartão' | 'Outro',
        contractType: result.contract_type as 'único' | 'mensal',
        contractMonths: result.contract_months,
        paymentDate: dateTransformers.fromSupabase(result.payment_date),
        accountType: result.account_type as 'Marlon Lopo' | 'Infinity B2B',
        received: result.received || false,
        receivedDate: result.received_date ? dateTransformers.fromSupabase(result.received_date) : undefined,
        createdAt: dateTransformers.fromSupabase(result.created_at)
      };

      setCompanyRevenues(prev => [newRevenue, ...prev]);
      toast({
        title: "Sucesso",
        description: "Receita salva com sucesso!"
      });
      return newRevenue;
    } catch (error: any) {
      console.error('Error in saveRevenue:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar receita",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCompanyExpense = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      console.log('Saving company expense data:', data);
      const { data: result, error } = await supabase
        .from('company_expenses')
        .insert({
          name: data.name,
          price: data.price,
          payment_method: data.paymentMethod,
          type: data.type,
          payment_date: data.paymentDate,
          paid: data.paid || false,
          paid_date: data.paidDate || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving company expense:', error);
        throw error;
      }
      
      const newExpense: CompanyExpense = {
        id: result.id,
        name: result.name,
        price: result.price,
        paymentMethod: result.payment_method as 'Pix' | 'Cartão' | 'Outro',
        type: result.type as 'Assinatura' | 'Único',
        paymentDate: dateTransformers.fromSupabase(result.payment_date),
        paid: result.paid || false,
        paidDate: result.paid_date ? dateTransformers.fromSupabase(result.paid_date) : undefined,
        createdAt: dateTransformers.fromSupabase(result.created_at)
      };

      setCompanyExpenses(prev => [newExpense, ...prev]);
      toast({
        title: "Sucesso",
        description: "Despesa salva com sucesso!"
      });
      return newExpense;
    } catch (error: any) {
      console.error('Error in saveCompanyExpense:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar despesa",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePersonalExpense = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      console.log('Saving personal expense data:', data);
      const { data: result, error } = await supabase
        .from('personal_expenses')
        .insert({
          name: data.name,
          price: data.price,
          payment_date: data.paymentDate,
          observation: data.observation || null,
          paid: data.paid || false,
          paid_date: data.paidDate || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving personal expense:', error);
        throw error;
      }
      
      const newExpense: PersonalExpense = {
        id: result.id,
        name: result.name,
        price: result.price,
        paymentDate: dateTransformers.fromSupabase(result.payment_date),
        observation: result.observation,
        paid: result.paid || false,
        paidDate: result.paid_date ? dateTransformers.fromSupabase(result.paid_date) : undefined,
        createdAt: dateTransformers.fromSupabase(result.created_at)
      };

      setPersonalExpenses(prev => [newExpense, ...prev]);
      toast({
        title: "Sucesso",
        description: "Conta salva com sucesso!"
      });
      return newExpense;
    } catch (error: any) {
      console.error('Error in savePersonalExpense:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar conta",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update operations with better error handling
  const updateRevenue = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    try {
      console.log('Updating revenue:', id, data);
      const updateData: any = {};
      if (data.clientName !== undefined) updateData.client_name = data.clientName;
      if (data.service !== undefined) updateData.service = data.service;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod;
      if (data.contractType !== undefined) updateData.contract_type = data.contractType;
      if (data.contractMonths !== undefined) updateData.contract_months = data.contractMonths;
      if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate;
      if (data.accountType !== undefined) updateData.account_type = data.accountType;
      if (data.received !== undefined) updateData.received = data.received;
      if (data.receivedDate !== undefined) updateData.received_date = data.receivedDate;

      const { error } = await supabase
        .from('company_revenues')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating revenue:', error);
        throw error;
      }

      setCompanyRevenues(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
      
      toast({
        title: "Sucesso",
        description: "Receita atualizada com sucesso!"
      });
    } catch (error: any) {
      console.error('Error in updateRevenue:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar receita",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCompanyExpense = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    try {
      console.log('Updating company expense:', id, data);
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate;
      if (data.paid !== undefined) updateData.paid = data.paid;
      if (data.paidDate !== undefined) updateData.paid_date = data.paidDate;

      const { error } = await supabase
        .from('company_expenses')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating company expense:', error);
        throw error;
      }

      setCompanyExpenses(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
      
      toast({
        title: "Sucesso",
        description: "Despesa atualizada com sucesso!"
      });
    } catch (error: any) {
      console.error('Error in updateCompanyExpense:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar despesa",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePersonalExpense = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    try {
      console.log('Updating personal expense:', id, data);
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate;
      if (data.observation !== undefined) updateData.observation = data.observation;
      if (data.paid !== undefined) updateData.paid = data.paid;
      if (data.paidDate !== undefined) updateData.paid_date = data.paidDate;

      const { error } = await supabase
        .from('personal_expenses')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating personal expense:', error);
        throw error;
      }

      setPersonalExpenses(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
      
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso!"
      });
    } catch (error: any) {
      console.error('Error in updatePersonalExpense:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar conta",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete operations with better error handling
  const deleteRevenue = useCallback(async (id: string) => {
    try {
      console.log('Deleting revenue:', id);
      const { error } = await supabase
        .from('company_revenues')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting revenue:', error);
        throw error;
      }

      setCompanyRevenues(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Receita excluída com sucesso!"
      });
    } catch (error: any) {
      console.error('Error in deleteRevenue:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir receita",
        variant: "destructive"
      });
      throw error;
    }
  }, []);

  const deleteCompanyExpense = useCallback(async (id: string) => {
    try {
      console.log('Deleting company expense:', id);
      const { error } = await supabase
        .from('company_expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company expense:', error);
        throw error;
      }

      setCompanyExpenses(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso!"
      });
    } catch (error: any) {
      console.error('Error in deleteCompanyExpense:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir despesa",
        variant: "destructive"
      });
      throw error;
    }
  }, []);

  const deletePersonalExpense = useCallback(async (id: string) => {
    try {
      console.log('Deleting personal expense:', id);
      const { error } = await supabase
        .from('personal_expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting personal expense:', error);
        throw error;
      }

      setPersonalExpenses(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Conta excluída com sucesso!"
      });
    } catch (error: any) {
      console.error('Error in deletePersonalExpense:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir conta",
        variant: "destructive"
      });
      throw error;
    }
  }, []);

  // Confirmation operations
  const confirmReceived = useCallback(async (id: string, receivedDate: Date = new Date()) => {
    try {
      await updateRevenue(id, { received: true, receivedDate: dateTransformers.toSupabase(receivedDate) });
    } catch (error) {
      console.error('Error confirming received:', error);
      throw error;
    }
  }, [updateRevenue]);

  const confirmPayment = useCallback(async (id: string, type: 'company' | 'personal', paidDate: Date = new Date()) => {
    try {
      if (type === 'company') {
        await updateCompanyExpense(id, { paid: true, paidDate: dateTransformers.toSupabase(paidDate) });
      } else {
        await updatePersonalExpense(id, { paid: true, paidDate: dateTransformers.toSupabase(paidDate) });
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }, [updateCompanyExpense, updatePersonalExpense]);

  // Set up real-time subscriptions with better error handling
  useEffect(() => {
    console.log('Setting up real-time subscriptions');
    const channel = supabase
      .channel('finance-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_revenues'
        },
        (payload) => {
          console.log('Real-time change in company_revenues:', payload);
          setTimeout(() => fetchAllData(), 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_expenses'
        },
        (payload) => {
          console.log('Real-time change in company_expenses:', payload);
          setTimeout(() => fetchAllData(), 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personal_expenses'
        },
        (payload) => {
          console.log('Real-time change in personal_expenses:', payload);
          setTimeout(() => fetchAllData(), 100);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  // Fetch data on mount
  useEffect(() => {
    console.log('Fetching initial data');
    fetchAllData();
  }, [fetchAllData]);

  return {
    // Data
    companyRevenues,
    companyExpenses,
    personalExpenses,
    
    // State
    isLoading,
    error,
    
    // Operations
    saveRevenue,
    saveCompanyExpense,
    savePersonalExpense,
    updateRevenue,
    updateCompanyExpense,
    updatePersonalExpense,
    deleteRevenue,
    deleteCompanyExpense,
    deletePersonalExpense,
    
    // Confirmation operations
    confirmReceived,
    confirmPayment,
    
    // Utilities
    fetchAllData
  };
};
