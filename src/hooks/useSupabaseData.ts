
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { toast } from '@/hooks/use-toast';
import { dateTransformers } from '@/lib/dateUtils';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import type { Database } from '@/integrations/supabase/types';
import { addToOutbox } from '@/lib/offlineSync';

export const useSupabaseData = () => {
  const [companyRevenues, setCompanyRevenues] = useState<CompanyRevenue[]>([]);
  const [companyExpenses, setCompanyExpenses] = useState<CompanyExpense[]>([]);
  const [personalExpenses, setPersonalExpenses] = useState<PersonalExpense[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  
  const { syncPendingOperations } = useBackgroundSync();
  
  // Use ref to prevent multiple subscriptions
  const channelRef = useRef<any>(null);
  const mountedRef = useRef(true);

  // Listen for sync messages from service worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_OFFLINE_DATA') {
        console.log('[Main] Received sync request from SW');
        // Mantém compatibilidade (pode não haver nada a sincronizar aqui),
        // mas garantimos um refresh geral.
        syncPendingOperations?.();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [syncPendingOperations]);

  // Helper para atualizar UI de forma otimista quando offline
  const applyOptimisticChange = useCallback((
    op: 'save' | 'update' | 'delete',
    table: 'company_revenues' | 'company_expenses' | 'personal_expenses',
    payload: any,
    recordId?: string
  ) => {
    if (table === 'company_revenues') {
      if (op === 'save') {
        const optimistic: CompanyRevenue = {
          id: `tmp-${crypto.randomUUID()}`,
          clientName: payload.client_name ?? '',
          service: payload.service ?? '',
          price: Number(payload.price) || 0,
          paymentMethod: payload.payment_method,
          contractType: payload.contract_type,
          contractMonths: payload.contract_months ?? undefined,
          paymentDate: dateTransformers.fromSupabase(payload.payment_date),
          accountType: payload.account_type,
          received: !!payload.received,
          receivedDate: payload.received_date ? dateTransformers.fromSupabase(payload.received_date) : undefined,
          createdAt: new Date()
        };
        setCompanyRevenues(prev => [optimistic, ...prev]);
      } else if (op === 'update' && recordId) {
        setCompanyRevenues(prev => prev.map(item => {
          if (item.id !== recordId) return item;
          return {
            ...item,
            clientName: payload.client_name ?? item.clientName,
            service: payload.service ?? item.service,
            price: payload.price !== undefined ? Number(payload.price) : item.price,
            paymentMethod: payload.payment_method ?? item.paymentMethod,
            contractType: payload.contract_type ?? item.contractType,
            contractMonths: payload.contract_months ?? item.contractMonths,
            paymentDate: payload.payment_date ? dateTransformers.fromSupabase(payload.payment_date) : item.paymentDate,
            accountType: payload.account_type ?? item.accountType,
            received: payload.received ?? item.received,
            receivedDate: payload.received_date ? dateTransformers.fromSupabase(payload.received_date) : item.receivedDate,
          };
        }));
      } else if (op === 'delete' && recordId) {
        setCompanyRevenues(prev => prev.filter(item => item.id !== recordId));
      }
      return;
    }

    if (table === 'company_expenses') {
      if (op === 'save') {
        const optimistic: CompanyExpense = {
          id: `tmp-${crypto.randomUUID()}`,
          name: payload.name ?? '',
          price: Number(payload.price) || 0,
          paymentMethod: payload.payment_method,
          type: payload.type,
          paymentDate: dateTransformers.fromSupabase(payload.payment_date),
          paid: !!payload.paid,
          paidDate: payload.paid_date ? dateTransformers.fromSupabase(payload.paid_date) : undefined,
          createdAt: new Date()
        };
        setCompanyExpenses(prev => [optimistic, ...prev]);
      } else if (op === 'update' && recordId) {
        setCompanyExpenses(prev => prev.map(item => {
          if (item.id !== recordId) return item;
          return {
            ...item,
            name: payload.name ?? item.name,
            price: payload.price !== undefined ? Number(payload.price) : item.price,
            paymentMethod: payload.payment_method ?? item.paymentMethod,
            type: payload.type ?? item.type,
            paymentDate: payload.payment_date ? dateTransformers.fromSupabase(payload.payment_date) : item.paymentDate,
            paid: payload.paid ?? item.paid,
            paidDate: payload.paid_date ? dateTransformers.fromSupabase(payload.paid_date) : item.paidDate,
          };
        }));
      } else if (op === 'delete' && recordId) {
        setCompanyExpenses(prev => prev.filter(item => item.id !== recordId));
      }
      return;
    }

    if (table === 'personal_expenses') {
      if (op === 'save') {
        const optimistic: PersonalExpense = {
          id: `tmp-${crypto.randomUUID()}`,
          name: payload.name ?? '',
          price: Number(payload.price) || 0,
          paymentDate: dateTransformers.fromSupabase(payload.payment_date),
          observation: payload.observation ?? undefined,
          paid: !!payload.paid,
          paidDate: payload.paid_date ? dateTransformers.fromSupabase(payload.paid_date) : undefined,
          createdAt: new Date()
        };
        setPersonalExpenses(prev => [optimistic, ...prev]);
      } else if (op === 'update' && recordId) {
        setPersonalExpenses(prev => prev.map(item => {
          if (item.id !== recordId) return item;
          return {
            ...item,
            name: payload.name ?? item.name,
            price: payload.price !== undefined ? Number(payload.price) : item.price,
            paymentDate: payload.payment_date ? dateTransformers.fromSupabase(payload.payment_date) : item.paymentDate,
            observation: payload.observation ?? item.observation,
            paid: payload.paid ?? item.paid,
            paidDate: payload.paid_date ? dateTransformers.fromSupabase(payload.paid_date) : item.paidDate,
          };
        }));
      } else if (op === 'delete' && recordId) {
        setPersonalExpenses(prev => prev.filter(item => item.id !== recordId));
      }
    }
  }, []);

  // Helper to handle offline operations
  const handleOfflineOperation = async (
    operation: () => Promise<any>,
    fallbackData: {
      type: 'save' | 'update' | 'delete';
      table: 'company_revenues' | 'company_expenses' | 'personal_expenses';
      data: any;
      recordId?: string;
    }
  ) => {
    try {
      const result = await operation();
      setIsConnected(true);
      return result;
    } catch (error) {
      console.error('Operation failed, checking if offline:', error);
      
      const isNetworkIssue =
        !navigator.onLine ||
        (error && (error.message?.includes('Failed to fetch') ||
          error.message?.includes('NetworkError') ||
          (error as any).code === 'NETWORK_FAILURE'));

      if (isNetworkIssue) {
        setIsConnected(false);

        // Adiciona à outbox para o SW sincronizar depois
        await addToOutbox({
          tableName: fallbackData.table,
          action: fallbackData.type,
          data: fallbackData.data,
          recordId: fallbackData.recordId,
        });

        // Registra background sync (com asserção para compatibilidade de tipos)
        navigator.serviceWorker?.ready
          .then((reg) => (reg as any)?.sync?.register('sync-outbox'))
          .catch((e) => console.error('Failed to register sync:', e));

        toast({
          title: "Operação salva offline",
          description: "Será sincronizada automaticamente quando a conexão retornar."
        });

        // Retorna nulo como indicador de operação offline (para atualização otimista)
        return null;
      }

      // Re-throw other errors
      throw error;
    }
  };

  // Fetch all data with better error handling
  const fetchAllData = useCallback(async () => {
    if (!mountedRef.current) return;
    
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching all data from Supabase...');
      
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

  // Save operations with offline support
  const saveRevenue = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      console.log('Saving revenue data:', data);
      
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
        received_date: data.receivedDate || null
      };

      const result = await handleOfflineOperation(
        async () => {
          const { data: insertedData, error } = await supabase.from('company_revenues').insert(insertData).select().maybeSingle();
          if (error) throw error;
          return { data: insertedData, error: null };
        },
        {
          type: 'save',
          table: 'company_revenues',
          data: insertData
        }
      );

      if (result?.data) {
        toast({
          title: "Sucesso",
          description: "Receita salva com sucesso!"
        });
        return result.data;
      } else if (result === null) {
        applyOptimisticChange('save', 'company_revenues', insertData);
        return null;
      }

      if (result?.error) {
        throw new Error(`Erro ao salvar receita: ${result.error.message}`);
      }
      
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
  }, [applyOptimisticChange]);

  const saveCompanyExpense = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      console.log('Saving company expense data:', data);
      
      const insertData = {
        name: data.name,
        price: Number(data.price),
        payment_method: data.paymentMethod,
        type: data.type,
        payment_date: data.paymentDate,
        paid: data.paid || false,
        paid_date: data.paidDate || null
      };

      const result = await handleOfflineOperation(
        async () => {
          const { data: insertedData, error } = await supabase.from('company_expenses').insert(insertData).select().maybeSingle();
          if (error) throw error;
          return { data: insertedData, error: null };
        },
        {
          type: 'save',
          table: 'company_expenses',
          data: insertData
        }
      );

      if (result?.data) {
        toast({
          title: "Sucesso",
          description: "Despesa salva com sucesso!"
        });
        return result.data;
      } else if (result === null) {
        applyOptimisticChange('save', 'company_expenses', insertData);
        return null;
      }

      if (result?.error) {
        throw new Error(`Erro ao salvar despesa: ${result.error.message}`);
      }
      
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
  }, [applyOptimisticChange]);

  const savePersonalExpense = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      console.log('Saving personal expense data:', data);
      
      const insertData = {
        name: data.name,
        price: Number(data.price),
        payment_date: data.paymentDate,
        observation: data.observation || null,
        paid: data.paid || false,
        paid_date: data.paidDate || null
      };

      const result = await handleOfflineOperation(
        async () => {
          const { data: insertedData, error } = await supabase.from('personal_expenses').insert(insertData).select().maybeSingle();
          if (error) throw error;
          return { data: insertedData, error: null };
        },
        {
          type: 'save',
          table: 'personal_expenses',
          data: insertData
        }
      );

      if (result?.data) {
        toast({
          title: "Sucesso",
          description: "Conta salva com sucesso!"
        });
        return result.data;
      } else if (result === null) {
        applyOptimisticChange('save', 'personal_expenses', insertData);
        return null;
      }

      if (result?.error) {
        throw new Error(`Erro ao salvar conta: ${result.error.message}`);
      }
      
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
  }, [applyOptimisticChange]);

  // Update operations
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

      const result = await handleOfflineOperation(
        async () => {
          const { error } = await supabase.from('company_revenues').update(updateData).eq('id', id);
          if (error) throw error;
          return { error: null };
        },
        {
          type: 'update',
          table: 'company_revenues',
          data: updateData,
          recordId: id
        }
      );

      if (result !== null || !result?.error) {
        toast({
          title: "Sucesso",
          description: "Receita atualizada com sucesso!"
        });
      } else if (result === null) {
        applyOptimisticChange('update', 'company_revenues', updateData, id);
      }
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
  }, [applyOptimisticChange]);

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

      const result = await handleOfflineOperation(
        async () => {
          const { error } = await supabase.from('company_expenses').update(updateData).eq('id', id);
          if (error) throw error;
          return { error: null };
        },
        {
          type: 'update',
          table: 'company_expenses',
          data: updateData,
          recordId: id
        }
      );

      if (result !== null || !result?.error) {
        toast({
          title: "Sucesso",
          description: "Despesa atualizada com sucesso!"
        });
      } else if (result === null) {
        applyOptimisticChange('update', 'company_expenses', updateData, id);
      }
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
  }, [applyOptimisticChange]);

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

      const result = await handleOfflineOperation(
        async () => {
          const { error } = await supabase.from('personal_expenses').update(updateData).eq('id', id);
          if (error) throw error;
          return { error: null };
        },
        {
          type: 'update',
          table: 'personal_expenses',
          data: updateData,
          recordId: id
        }
      );

      if (result !== null || !result?.error) {
        toast({
          title: "Sucesso",
          description: "Conta atualizada com sucesso!"
        });
      } else if (result === null) {
        applyOptimisticChange('update', 'personal_expenses', updateData, id);
      }
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
  }, [applyOptimisticChange]);

  // Delete operations
  const deleteRevenue = useCallback(async (id: string) => {
    try {
      console.log('Deleting revenue:', id);
      const result = await handleOfflineOperation(
        async () => {
          const { error } = await supabase.from('company_revenues').delete().eq('id', id);
          if (error) throw error;
          return { error: null };
        },
        {
          type: 'delete',
          table: 'company_revenues',
          data: {},
          recordId: id
        }
      );

      if (result !== null || !result?.error) {
        toast({
          title: "Sucesso",
          description: "Receita excluída com sucesso!"
        });
      } else if (result === null) {
        applyOptimisticChange('delete', 'company_revenues', {}, id);
      }
    } catch (error: any) {
      console.error('Error in deleteRevenue:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir receita",
        variant: "destructive"
      });
      throw error;
    }
  }, [applyOptimisticChange]);

  const deleteCompanyExpense = useCallback(async (id: string) => {
    try {
      console.log('Deleting company expense:', id);
      const result = await handleOfflineOperation(
        async () => {
          const { error } = await supabase.from('company_expenses').delete().eq('id', id);
          if (error) throw error;
          return { error: null };
        },
        {
          type: 'delete',
          table: 'company_expenses',
          data: {},
          recordId: id
        }
      );

      if (result !== null || !result?.error) {
        toast({
          title: "Sucesso",
          description: "Despesa excluída com sucesso!"
        });
      } else if (result === null) {
        applyOptimisticChange('delete', 'company_expenses', {}, id);
      }
    } catch (error: any) {
      console.error('Error in deleteCompanyExpense:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir despesa",
        variant: "destructive"
      });
      throw error;
    }
  }, [applyOptimisticChange]);

  const deletePersonalExpense = useCallback(async (id: string) => {
    try {
      console.log('Deleting personal expense:', id);
      const result = await handleOfflineOperation(
        async () => {
          const { error } = await supabase.from('personal_expenses').delete().eq('id', id);
          if (error) throw error;
          return { error: null };
        },
        {
          type: 'delete',
          table: 'personal_expenses',
          data: {},
          recordId: id
        }
      );

      if (result !== null || !result?.error) {
        toast({
          title: "Sucesso",
          description: "Conta excluída com sucesso!"
        });
      } else if (result === null) {
        applyOptimisticChange('delete', 'personal_expenses', {}, id);
      }
    } catch (error: any) {
      console.error('Error in deletePersonalExpense:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir conta",
        variant: "destructive"
      });
      throw error;
    }
  }, [applyOptimisticChange]);

  // Confirmation operations
  const confirmReceived = useCallback(async (id: string, receivedDate: Date = new Date()) => {
    try {
      await updateRevenue(id, { received: true, receivedDate: dateTransformers.toSupabase(receivedDate) });
    } catch (error) {
      console.error('Error in confirmReceived:', error);
      throw error;
    }
  }, [updateRevenue]);

  const confirmPayment = useCallback(async (id: string, type: 'company' | 'personal', paidDate: Date = new Date()) => {
    try {
      if (type === 'company') {
        const transformedData = {
          paid: true,
          paidDate: dateTransformers.toSupabase(paidDate)
        };
        await updateCompanyExpense(id, transformedData);
      } else {
        const transformedData = {
          paid: true,
          paidDate: dateTransformers.toSupabase(paidDate)
        };
        await updatePersonalExpense(id, transformedData);
      }
    } catch (error) {
      console.error('Error in confirmPayment:', error);
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
