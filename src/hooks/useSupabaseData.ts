
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { toast } from '@/hooks/use-toast';
import { dateTransformers } from '@/lib/dateUtils';
import type { Database } from '@/integrations/supabase/types';

export const useSupabaseData = () => {
  const [companyRevenues, setCompanyRevenues] = useState<CompanyRevenue[]>([]);
  const [companyExpenses, setCompanyExpenses] = useState<CompanyExpense[]>([]);
  const [personalExpenses, setPersonalExpenses] = useState<PersonalExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  
  // Use ref to prevent multiple subscriptions
  const channelRef = useRef<any>(null);
  const mountedRef = useRef(true);

  // Fetch all data with better error handling
  const fetchAllData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching all data from Supabase...');
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

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

      // Check for errors
      if (revenuesResult.error) {
        console.error('Error fetching revenues:', revenuesResult.error);
        throw new Error(`Erro ao carregar receitas: ${revenuesResult.error.message}`);
      }
      if (companyExpensesResult.error) {
        console.error('Error fetching company expenses:', companyExpensesResult.error);
        throw new Error(`Erro ao carregar despesas empresariais: ${companyExpensesResult.error.message}`);
      }
      if (personalExpensesResult.error) {
        console.error('Error fetching personal expenses:', personalExpensesResult.error);
        throw new Error(`Erro ao carregar despesas pessoais: ${personalExpensesResult.error.message}`);
      }

      if (!mountedRef.current) return;

      // Transform data with improved error handling
      const transformedRevenues = (revenuesResult.data || []).map(item => {
        try {
          return {
            id: item.id,
            clientName: item.client_name || '',
            service: item.service || '',
            price: Number(item.price) || 0,
            paymentMethod: (item.payment_method || 'Pix') as 'Pix' | 'Cartão' | 'Outro',
            contractType: (item.contract_type || 'único') as 'único' | 'mensal',
            contractMonths: item.contract_months || undefined,
            paymentDate: dateTransformers.fromSupabase(item.payment_date),
            accountType: (item.account_type || 'Marlon Lopo') as 'Marlon Lopo' | 'Infinity B2B',
            received: item.received || false,
            receivedDate: item.received_date ? dateTransformers.fromSupabase(item.received_date) : undefined,
            createdAt: dateTransformers.fromSupabase(item.created_at)
          };
        } catch (err) {
          console.error('Error transforming revenue item:', item, err);
          return null;
        }
      }).filter(Boolean) as CompanyRevenue[];

      const transformedCompanyExpenses = (companyExpensesResult.data || []).map(item => {
        try {
          return {
            id: item.id,
            name: item.name || '',
            price: Number(item.price) || 0,
            paymentMethod: (item.payment_method || 'Pix') as 'Pix' | 'Cartão' | 'Outro',
            type: (item.type || 'Único') as 'Assinatura' | 'Único',
            paymentDate: dateTransformers.fromSupabase(item.payment_date),
            paid: item.paid || false,
            paidDate: item.paid_date ? dateTransformers.fromSupabase(item.paid_date) : undefined,
            createdAt: dateTransformers.fromSupabase(item.created_at)
          };
        } catch (err) {
          console.error('Error transforming company expense item:', item, err);
          return null;
        }
      }).filter(Boolean) as CompanyExpense[];

      const transformedPersonalExpenses = (personalExpensesResult.data || []).map(item => {
        try {
          return {
            id: item.id,
            name: item.name || '',
            price: Number(item.price) || 0,
            paymentDate: dateTransformers.fromSupabase(item.payment_date),
            observation: item.observation || undefined,
            paid: item.paid || false,
            paidDate: item.paid_date ? dateTransformers.fromSupabase(item.paid_date) : undefined,
            createdAt: dateTransformers.fromSupabase(item.created_at)
          };
        } catch (err) {
          console.error('Error transforming personal expense item:', item, err);
          return null;
        }
      }).filter(Boolean) as PersonalExpense[];

      setCompanyRevenues(transformedRevenues);
      setCompanyExpenses(transformedCompanyExpenses);
      setPersonalExpenses(transformedPersonalExpenses);
      setIsConnected(true);

      console.log('Data loaded successfully:', {
        revenues: transformedRevenues.length,
        companyExpenses: transformedCompanyExpenses.length,
        personalExpenses: transformedPersonalExpenses.length
      });

    } catch (err: any) {
      console.error('Error in fetchAllData:', err);
      if (mountedRef.current) {
        setError(err.message || 'Erro desconhecido ao carregar dados');
        setIsConnected(false);
        toast({
          title: "Erro ao carregar dados",
          description: err.message || 'Erro desconhecido',
          variant: "destructive"
        });
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Save operations with improved error handling and loading states
  const saveRevenue = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      console.log('Saving revenue data:', data);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const insertData = {
        client_name: data.clientName,
        service: data.service,
        price: Number(data.price),
        payment_method: data.paymentMethod,
        contract_type: data.contractType,
        contract_months: data.contractMonths || null,
        payment_date: data.paymentDate,
        account_type: data.accountType,
        received: data.received || false,
        received_date: data.receivedDate || null,
        user_id: user.id
      };

      const { data: result, error } = await supabase
        .from('company_revenues')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving revenue:', error);
        throw new Error(`Erro ao salvar receita: ${error.message}`);
      }

      if (!result) {
        throw new Error('Erro inesperado: resultado vazio do banco');
      }
      
      // Don't manually update state - let real-time subscription handle it
      toast({
        title: "Sucesso",
        description: "Receita salva com sucesso!"
      });
      
      return result;
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
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const insertData = {
        name: data.name,
        price: Number(data.price),
        payment_method: data.paymentMethod,
        type: data.type,
        payment_date: data.paymentDate,
        paid: data.paid || false,
        paid_date: data.paidDate || null,
        user_id: user.id
      };

      const { data: result, error } = await supabase
        .from('company_expenses')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving company expense:', error);
        throw new Error(`Erro ao salvar despesa: ${error.message}`);
      }

      if (!result) {
        throw new Error('Erro inesperado: resultado vazio do banco');
      }
      
      toast({
        title: "Sucesso",
        description: "Despesa salva com sucesso!"
      });
      
      return result;
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
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const insertData = {
        name: data.name,
        price: Number(data.price),
        payment_date: data.paymentDate,
        observation: data.observation || null,
        paid: data.paid || false,
        paid_date: data.paidDate || null,
        user_id: user.id
      };

      const { data: result, error } = await supabase
        .from('personal_expenses')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving personal expense:', error);
        throw new Error(`Erro ao salvar conta: ${error.message}`);
      }

      if (!result) {
        throw new Error('Erro inesperado: resultado vazio do banco');
      }
      
      toast({
        title: "Sucesso",
        description: "Conta salva com sucesso!"
      });
      
      return result;
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
      if (data.price !== undefined) updateData.price = Number(data.price);
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
        throw new Error(`Erro ao atualizar receita: ${error.message}`);
      }
      
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
      if (data.price !== undefined) updateData.price = Number(data.price);
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
        throw new Error(`Erro ao atualizar despesa: ${error.message}`);
      }
      
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
      if (data.price !== undefined) updateData.price = Number(data.price);
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
        throw new Error(`Erro ao atualizar conta: ${error.message}`);
      }
      
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
        throw new Error(`Erro ao excluir receita: ${error.message}`);
      }

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
        throw new Error(`Erro ao excluir despesa: ${error.message}`);
      }

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
        throw new Error(`Erro ao excluir conta: ${error.message}`);
      }

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

  // Improved real-time subscriptions with reconnection handling
  useEffect(() => {
    console.log('Setting up real-time subscriptions');
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    
    const setupSubscription = () => {
      // Clean up existing channel
      if (channelRef.current) {
        console.log('Cleaning up existing channel');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      const channel = supabase
        .channel('finance-data-changes', {
          config: {
            broadcast: { self: true }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'company_revenues'
          },
          (payload) => {
            console.log('Real-time change in company_revenues:', payload);
            if (mountedRef.current) {
              // Debounce the refetch to avoid too many calls
              setTimeout(() => {
                if (mountedRef.current) {
                  fetchAllData();
                }
              }, 100);
            }
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
            if (mountedRef.current) {
              setTimeout(() => {
                if (mountedRef.current) {
                  fetchAllData();
                }
              }, 100);
            }
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
            if (mountedRef.current) {
              setTimeout(() => {
                if (mountedRef.current) {
                  fetchAllData();
                }
              }, 100);
            }
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            reconnectAttempts = 0;
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            if (reconnectAttempts < maxReconnectAttempts && mountedRef.current) {
              reconnectAttempts++;
              console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})`);
              setTimeout(setupSubscription, 2000 * reconnectAttempts);
            }
          }
        });

      channelRef.current = channel;
    };

    setupSubscription();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      mountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [fetchAllData]);

  // Initial data fetch on mount
  useEffect(() => {
    console.log('Component mounted, fetching initial data');
    fetchAllData();
    
    return () => {
      mountedRef.current = false;
    };
  }, [fetchAllData]);

  return {
    // Data
    companyRevenues,
    companyExpenses,
    personalExpenses,
    
    // State
    isLoading,
    error,
    isConnected,
    
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
