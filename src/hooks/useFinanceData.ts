
import { useState, useCallback, useMemo } from 'react';
import { storageService } from '@/lib/storage';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';

export const useFinanceData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoized data getters
  const companyRevenues = useMemo(() => storageService.getCompanyRevenues(), []);
  const companyExpenses = useMemo(() => storageService.getCompanyExpenses(), []);
  const personalExpenses = useMemo(() => storageService.getPersonalExpenses(), []);

  // Optimized save operations with error handling
  const saveRevenue = useCallback(async (data: Omit<CompanyRevenue, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = storageService.saveCompanyRevenue(data);
      return result;
    } catch (err) {
      setError('Erro ao salvar receita');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCompanyExpense = useCallback(async (data: Omit<CompanyExpense, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = storageService.saveCompanyExpense(data);
      return result;
    } catch (err) {
      setError('Erro ao salvar despesa empresarial');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePersonalExpense = useCallback(async (data: Omit<PersonalExpense, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = storageService.savePersonalExpense(data);
      return result;
    } catch (err) {
      setError('Erro ao salvar conta pessoal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Optimized update operations
  const updateRevenue = useCallback(async (id: string, data: Partial<CompanyRevenue>) => {
    setIsLoading(true);
    setError(null);
    try {
      storageService.updateCompanyRevenue(id, data);
    } catch (err) {
      setError('Erro ao atualizar receita');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCompanyExpense = useCallback(async (id: string, data: Partial<CompanyExpense>) => {
    setIsLoading(true);
    setError(null);
    try {
      storageService.updateCompanyExpense(id, data);
    } catch (err) {
      setError('Erro ao atualizar despesa empresarial');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePersonalExpense = useCallback(async (id: string, data: Partial<PersonalExpense>) => {
    setIsLoading(true);
    setError(null);
    try {
      storageService.updatePersonalExpense(id, data);
    } catch (err) {
      setError('Erro ao atualizar conta pessoal');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete operations
  const deleteRevenue = useCallback((id: string) => {
    try {
      storageService.deleteCompanyRevenue(id);
    } catch (err) {
      setError('Erro ao excluir receita');
      throw err;
    }
  }, []);

  const deleteCompanyExpense = useCallback((id: string) => {
    try {
      storageService.deleteCompanyExpense(id);
    } catch (err) {
      setError('Erro ao excluir despesa empresarial');
      throw err;
    }
  }, []);

  const deletePersonalExpense = useCallback((id: string) => {
    try {
      storageService.deletePersonalExpense(id);
    } catch (err) {
      setError('Erro ao excluir conta pessoal');
      throw err;
    }
  }, []);

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
    deletePersonalExpense
  };
};
