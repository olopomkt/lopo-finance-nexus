
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { toast } from '@/hooks/use-toast';

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [companyRevenues, setCompanyRevenues] = useState<CompanyRevenue[]>([]);
  const [companyExpenses, setCompanyExpenses] = useState<CompanyExpense[]>([]);
  const [personalExpenses, setPersonalExpenses] = useState<PersonalExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const [revenuesResult, companyExpensesResult, personalExpensesResult] = await Promise.all([
        supabase
          .from('company_revenues')
          .select('*')
          .eq('user_id', user.id)
          .order('payment_date', { ascending: false }),
        supabase
          .from('company_expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('payment_date', { ascending: false }),
        supabase
          .from('personal_expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('payment_date', { ascending: false })
      ]);

      if (revenuesResult.error) throw revenuesResult.error;
      if (companyExpensesResult.error) throw companyExpensesResult.error;
      if (personalExpensesResult.error) throw personalExpensesResult.error;

      setCompanyRevenues(revenuesResult.data?.map(item => ({
        id: item.id,
        clientName: item.client_name,
        service: item.service,
        price: item.price,
        paymentMethod: item.payment_method as 'Pix' | 'Cartão' | 'Outro',
        contractType: item.contract_type as 'único' | 'mensal',
        contractMonths: item.contract_months,
        paymentDate: new Date(item.payment_date),
        createdAt: new Date(item.created_at)
      })) || []);

      setCompanyExpenses(companyExpensesResult.data?.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        paymentMethod: item.payment_method as 'Pix' | 'Cartão' | 'Outro',
        type: item.type as 'Assinatura' | 'Único',
        paymentDate: new Date(item.payment_date),
        createdAt: new Date(item.created_at)
      })) || []);

      setPersonalExpenses(personalExpensesResult.data?.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        paymentDate: new Date(item.payment_date),
        observation: item.observation,
        createdAt: new Date(item.created_at)
      })) || []);

    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Erro ao carregar dados",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Save operations
  const saveRevenue = useCallback(async (data: Omit<CompanyRevenue, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('company_revenues')
        .insert({
          user_id: user.id,
          client_name: data.clientName,
          service: data.service,
          price: data.price,
          payment_method: data.paymentMethod,
          contract_type: data.contractType,
          contract_months: data.contractMonths,
          payment_date: data.paymentDate.toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      
      const newRevenue: CompanyRevenue = {
        id: result.id,
        clientName: result.client_name,
        service: result.service,
        price: result.price,
        paymentMethod: result.payment_method as 'Pix' | 'Cartão' | 'Outro',
        contractType: result.contract_type as 'único' | 'mensal',
        contractMonths: result.contract_months,
        paymentDate: new Date(result.payment_date),
        createdAt: new Date(result.created_at)
      };

      setCompanyRevenues(prev => [newRevenue, ...prev]);
      return newRevenue;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveCompanyExpense = useCallback(async (data: Omit<CompanyExpense, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('company_expenses')
        .insert({
          user_id: user.id,
          name: data.name,
          price: data.price,
          payment_method: data.paymentMethod,
          type: data.type,
          payment_date: data.paymentDate.toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      
      const newExpense: CompanyExpense = {
        id: result.id,
        name: result.name,
        price: result.price,
        paymentMethod: result.payment_method as 'Pix' | 'Cartão' | 'Outro',
        type: result.type as 'Assinatura' | 'Único',
        paymentDate: new Date(result.payment_date),
        createdAt: new Date(result.created_at)
      };

      setCompanyExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const savePersonalExpense = useCallback(async (data: Omit<PersonalExpense, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('personal_expenses')
        .insert({
          user_id: user.id,
          name: data.name,
          price: data.price,
          payment_date: data.paymentDate.toISOString().split('T')[0],
          observation: data.observation
        })
        .select()
        .single();

      if (error) throw error;
      
      const newExpense: PersonalExpense = {
        id: result.id,
        name: result.name,
        price: result.price,
        paymentDate: new Date(result.payment_date),
        observation: result.observation,
        createdAt: new Date(result.created_at)
      };

      setPersonalExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Update operations
  const updateRevenue = useCallback(async (id: string, data: Partial<CompanyRevenue>) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      const updateData: any = {};
      if (data.clientName !== undefined) updateData.client_name = data.clientName;
      if (data.service !== undefined) updateData.service = data.service;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod;
      if (data.contractType !== undefined) updateData.contract_type = data.contractType;
      if (data.contractMonths !== undefined) updateData.contract_months = data.contractMonths;
      if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate.toISOString().split('T')[0];

      const { error } = await supabase
        .from('company_revenues')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCompanyRevenues(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateCompanyExpense = useCallback(async (id: string, data: Partial<CompanyExpense>) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate.toISOString().split('T')[0];

      const { error } = await supabase
        .from('company_expenses')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCompanyExpenses(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updatePersonalExpense = useCallback(async (id: string, data: Partial<PersonalExpense>) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.price !== undefined) updateData.price = data.price;
      if (data.paymentDate !== undefined) updateData.payment_date = data.paymentDate.toISOString().split('T')[0];
      if (data.observation !== undefined) updateData.observation = data.observation;

      const { error } = await supabase
        .from('personal_expenses')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPersonalExpenses(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Delete operations
  const deleteRevenue = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('company_revenues')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setCompanyRevenues(prev => prev.filter(item => item.id !== id));
  }, [user]);

  const deleteCompanyExpense = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('company_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setCompanyExpenses(prev => prev.filter(item => item.id !== id));
  }, [user]);

  const deletePersonalExpense = useCallback(async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('personal_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    setPersonalExpenses(prev => prev.filter(item => item.id !== id));
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('finance-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_revenues',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          setTimeout(() => fetchAllData(), 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_expenses',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          setTimeout(() => fetchAllData(), 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'personal_expenses',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          setTimeout(() => fetchAllData(), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchAllData]);

  // Fetch data when user changes
  useEffect(() => {
    if (user) {
      fetchAllData();
    } else {
      setCompanyRevenues([]);
      setCompanyExpenses([]);
      setPersonalExpenses([]);
    }
  }, [user, fetchAllData]);

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
    
    // Utilities
    fetchAllData
  };
};
