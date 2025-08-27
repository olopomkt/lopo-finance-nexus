
import { useMemo } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { CompanyRevenue, CompanyExpense, PersonalExpense, CombinedEntry } from '@/types';

// Função de segurança para validar datas
const isValidDate = (d: any): boolean => d instanceof Date && !isNaN(d.getTime());

export function useFinanceData() {
  const { 
    companyRevenues: rawRevenues, 
    companyExpenses: rawCompanyExpenses, 
    personalExpenses: rawPersonalExpenses, 
    isLoading, 
    error, 
    isConnected,
    saveRevenue: saveCompanyRevenue,
    updateRevenue: updateCompanyRevenue,
    deleteRevenue: deleteCompanyRevenue,
    saveCompanyExpense,
    updateCompanyExpense,
    deleteCompanyExpense,
    savePersonalExpense,
    updatePersonalExpense,
    deletePersonalExpense,
    confirmReceived,
    confirmPayment,
    fetchAllData
  } = useSupabaseData();

  const { combinedData, companyRevenues, companyExpenses, personalExpenses } = useMemo(() => {
    // First sanitize individual arrays
    const sanitizedRevenues = (rawRevenues || []).filter(item => {
      const date = item.paymentDate ? new Date(item.paymentDate) : null;
      if (date && isValidDate(date)) {
        return true;
      }
      console.warn('Revenue record discarded due to invalid date:', item);
      return false;
    });

    const sanitizedCompanyExpenses = (rawCompanyExpenses || []).filter(item => {
      const date = item.paymentDate ? new Date(item.paymentDate) : null;
      if (date && isValidDate(date)) {
        return true;
      }
      console.warn('Company expense record discarded due to invalid date:', item);
      return false;
    });

    const sanitizedPersonalExpenses = (rawPersonalExpenses || []).filter(item => {
      const date = item.paymentDate ? new Date(item.paymentDate) : null;
      if (date && isValidDate(date)) {
        return true;
      }
      console.warn('Personal expense record discarded due to invalid date:', item);
      return false;
    });

    // Create combined entries
    const revenueEntries: CombinedEntry[] = sanitizedRevenues.map(item => ({
      ...item,
      type: 'revenue' as const,
      date: new Date(item.paymentDate),
      client: item.clientName,
      description: item.service,
      amount: item.price
    }));

    const companyExpenseEntries: CombinedEntry[] = sanitizedCompanyExpenses.map(item => ({
      ...item,
      type: 'company_expense' as const,
      date: new Date(item.paymentDate),
      description: item.name,
      amount: item.price,
      category: item.type
    }));

    const personalExpenseEntries: CombinedEntry[] = sanitizedPersonalExpenses.map(item => ({
      ...item,
      type: 'personal_expense' as const,
      date: new Date(item.paymentDate),
      description: item.name,
      amount: item.price,
      details: item.observation
    }));

    const allCombined = [
      ...revenueEntries,
      ...companyExpenseEntries,
      ...personalExpenseEntries
    ];

    // Sort by date (newest first)
    allCombined.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      combinedData: allCombined,
      companyRevenues: sanitizedRevenues,
      companyExpenses: sanitizedCompanyExpenses,
      personalExpenses: sanitizedPersonalExpenses
    };
  }, [rawRevenues, rawCompanyExpenses, rawPersonalExpenses]);

  return { 
    // Combined data
    combinedData,
    // Individual arrays for backward compatibility
    companyRevenues,
    companyExpenses,
    personalExpenses,
    // State
    isLoading, 
    error,
    isConnected,
    // CRUD operations with correct naming
    saveRevenue: saveCompanyRevenue,
    updateRevenue: updateCompanyRevenue,
    deleteRevenue: deleteCompanyRevenue,
    saveCompanyRevenue,
    updateCompanyRevenue,
    deleteCompanyRevenue,
    saveCompanyExpense,
    updateCompanyExpense,
    deleteCompanyExpense,
    savePersonalExpense,
    updatePersonalExpense,
    deletePersonalExpense,
    // Confirmation operations
    confirmReceived,
    confirmPayment,
    // Utilities
    fetchAllData
  };
}
