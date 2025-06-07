import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { toast } from '@/hooks/use-toast';

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
        paymentDate: item.payment_date,
        accountType: (item.account_type || 'Marlon Lopo') as 'Marlon Lopo' | 'Infinity B2B',
        received: item.received || false,
        receivedDate: item.received_date,
        createdAt: item.created_at
      })) || []);

      setCompanyExpenses(companyExpensesResult.data?.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        paymentMethod: item.payment_method as 'Pix' | 'Cartão' | 'Outro',
        type: item.type as 'Assinatura' | 'Único',
        paymentDate: item.payment_date,
        paid: item.paid || false,
        paidDate: item.paid_date,
        createdAt: item.created_at
      })) || []);

      setPersonalExpenses(personalExpensesResult.data?.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        paymentDate: item.payment_date,
        observation: item.observation,
        paid: item.paid || false,
        paidDate: item.paid_date,
        createdAt: item.created_at
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
  }, []);

  // Save operations
  const saveRevenue = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
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
          received: data.received,
          received_date: data.receivedDate
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
        paymentDate: result.payment_date,
        accountType: result.account_type as 'Marlon Lopo' | 'Infinity B2B',
        received: result.received || false,
        receivedDate: result.received_date,
        createdAt: result.created_at
      };

      setCompanyRevenues(prev => [newRevenue, ...prev]);
      return newRevenue;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCompanyExpense = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('company_expenses')
        .insert({
          name: data.name,
          price: data.price,
          payment_method: data.paymentMethod,
          type: data.type,
          payment_date: data.paymentDate,
          paid: data.paid,
          paid_date: data.paidDate
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
        paymentDate: result.payment_date,
        paid: result.paid || false,
        paidDate: result.paid_date,
        createdAt: result.created_at
      };

      setCompanyExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePersonalExpense = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      const { data: result, error } = await supabase
        .from('personal_expenses')
        .insert({
          name: data.name,
          price: data.price,
          payment_date: data.paymentDate,
          observation: data.observation,
          paid: data.paid,
          paid_date: data.paidDate
        })
        .select()
        .single();

      if (error) throw error;
      
      const newExpense: PersonalExpense = {
        id: result.id,
        name: result.name,
        price: result.price,
        paymentDate: result.payment_date,
        observation: result.observation,
        paid: result.paid || false,
        paidDate: result.paid_date,
        createdAt: result.created_at
      };

      setPersonalExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update operations
  const updateRevenue = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    try {
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

      if (error) throw error;

      setCompanyRevenues(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCompanyExpense = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    try {
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

      if (error) throw error;

      setCompanyExpenses(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePersonalExpense = useCallback(async (id: string, data: any) => {
    setIsLoading(true);
    try {
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

      if (error) throw error;

      setPersonalExpenses(prev => 
        prev.map(item => item.id === id ? { ...item, ...data } : item)
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete operations
  const deleteRevenue = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('company_revenues')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setCompanyRevenues(prev => prev.filter(item => item.id !== id));
  }, []);

  const deleteCompanyExpense = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('company_expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setCompanyExpenses(prev => prev.filter(item => item.id !== id));
  }, []);

  const deletePersonalExpense = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('personal_expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setPersonalExpenses(prev => prev.filter(item => item.id !== id));
  }, []);

  // Confirmation operations
  const confirmReceived = useCallback(async (id: string, receivedDate: Date = new Date()) => {
    await updateRevenue(id, { received: true, receivedDate: receivedDate.toISOString().split('T')[0] });
    toast({ title: "Sucesso", description: "Recebimento confirmado!" });
  }, [updateRevenue]);

  const confirmPayment = useCallback(async (id: string, type: 'company' | 'personal', paidDate: Date = new Date()) => {
    if (type === 'company') {
      await updateCompanyExpense(id, { paid: true, paidDate: paidDate.toISOString().split('T')[0] });
    } else {
      await updatePersonalExpense(id, { paid: true, paidDate: paidDate.toISOString().split('T')[0] });
    }
    toast({ title: "Sucesso", description: "Pagamento confirmado!" });
  }, [updateCompanyExpense, updatePersonalExpense]);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('finance-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'company_revenues'
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
          table: 'company_expenses'
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
          table: 'personal_expenses'
        },
        () => {
          setTimeout(() => fetchAllData(), 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAllData]);

  // Fetch data on mount
  useEffect(() => {
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
