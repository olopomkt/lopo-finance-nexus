
// src/hooks/useFinanceData.ts (Versão Final "À Prova de Balas")
import { useMemo } from 'react';
import { useSupabaseData } from './useSupabaseData';
import { CompanyRevenue, CompanyExpense, PersonalExpense, CombinedEntry } from '@/types';

const isValidDate = (d: any): d is Date => d instanceof Date && !isNaN(d.getTime());

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
    console.log("Iniciando combinação e saneamento de dados...");
    
    // First sanitize individual arrays with enhanced validation
    const sanitizedRevenues = (rawRevenues || []).filter(item => {
      if (!item || typeof item !== 'object') {
        console.error("DEBUG: Revenue item inválido (não é objeto) descartado:", item);
        return false;
      }
      if (item.paymentDate === null || item.paymentDate === undefined || item.price === null || item.price === undefined) {
        console.error("DEBUG: Revenue descartado por 'paymentDate' ou 'price' nulos/indefinidos:", item);
        return false;
      }
      const date = new Date(item.paymentDate);
      if (!isValidDate(date)) {
        console.error("DEBUG: Revenue descartado por data inválida:", item.paymentDate, item);
        return false;
      }
      return true;
    });

    const sanitizedCompanyExpenses = (rawCompanyExpenses || []).filter(item => {
      if (!item || typeof item !== 'object') {
        console.error("DEBUG: Company expense item inválido (não é objeto) descartado:", item);
        return false;
      }
      if (item.paymentDate === null || item.paymentDate === undefined || item.price === null || item.price === undefined) {
        console.error("DEBUG: Company expense descartado por 'paymentDate' ou 'price' nulos/indefinidos:", item);
        return false;
      }
      const date = new Date(item.paymentDate);
      if (!isValidDate(date)) {
        console.error("DEBUG: Company expense descartado por data inválida:", item.paymentDate, item);
        return false;
      }
      return true;
    });

    const sanitizedPersonalExpenses = (rawPersonalExpenses || []).filter(item => {
      if (!item || typeof item !== 'object') {
        console.error("DEBUG: Personal expense item inválido (não é objeto) descartado:", item);
        return false;
      }
      if (item.paymentDate === null || item.paymentDate === undefined || item.price === null || item.price === undefined) {
        console.error("DEBUG: Personal expense descartado por 'paymentDate' ou 'price' nulos/indefinidos:", item);
        return false;
      }
      const date = new Date(item.paymentDate);
      if (!isValidDate(date)) {
        console.error("DEBUG: Personal expense descartado por data inválida:", item.paymentDate, item);
        return false;
      }
      return true;
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
    
    console.log("DEBUG: Dados combinados e saneados:", allCombined.length, "registros válidos.");

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
