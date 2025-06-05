
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseData } from './useSupabaseData';
import { storageService } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

export const useDataMigration = () => {
  const { user } = useAuth();
  const { saveRevenue, saveCompanyExpense, savePersonalExpense } = useSupabaseData();
  const [isMigrating, setIsMigrating] = useState(false);
  const [hasMigrated, setHasMigrated] = useState(false);

  useEffect(() => {
    const checkAndMigrate = async () => {
      if (!user || hasMigrated || isMigrating) return;

      // Check if there's localStorage data to migrate
      const localRevenues = storageService.getCompanyRevenues();
      const localCompanyExpenses = storageService.getCompanyExpenses();
      const localPersonalExpenses = storageService.getPersonalExpenses();

      const hasLocalData = localRevenues.length > 0 || 
                          localCompanyExpenses.length > 0 || 
                          localPersonalExpenses.length > 0;

      if (!hasLocalData) {
        setHasMigrated(true);
        return;
      }

      setIsMigrating(true);

      try {
        // Migrate company revenues
        for (const revenue of localRevenues) {
          await saveRevenue({
            clientName: revenue.clientName,
            service: revenue.service,
            price: revenue.price,
            paymentMethod: revenue.paymentMethod,
            contractType: revenue.contractType,
            contractMonths: revenue.contractMonths,
            paymentDate: revenue.paymentDate
          });
        }

        // Migrate company expenses
        for (const expense of localCompanyExpenses) {
          await saveCompanyExpense({
            name: expense.name,
            price: expense.price,
            paymentMethod: expense.paymentMethod,
            type: expense.type,
            paymentDate: expense.paymentDate
          });
        }

        // Migrate personal expenses
        for (const expense of localPersonalExpenses) {
          await savePersonalExpense({
            name: expense.name,
            price: expense.price,
            paymentDate: expense.paymentDate,
            observation: expense.observation
          });
        }

        // Clear localStorage after successful migration
        localStorage.removeItem('company-revenues');
        localStorage.removeItem('company-expenses');
        localStorage.removeItem('personal-expenses');

        toast({
          title: "Migração concluída!",
          description: "Seus dados foram migrados com sucesso para o banco de dados."
        });

      } catch (error) {
        console.error('Migration error:', error);
        toast({
          title: "Erro na migração",
          description: "Houve um problema ao migrar seus dados. Tente novamente.",
          variant: "destructive"
        });
      } finally {
        setIsMigrating(false);
        setHasMigrated(true);
      }
    };

    // Run migration after a short delay to ensure everything is ready
    const timer = setTimeout(checkAndMigrate, 1000);
    return () => clearTimeout(timer);
  }, [user, saveRevenue, saveCompanyExpense, savePersonalExpense, hasMigrated, isMigrating]);

  return { isMigrating, hasMigrated };
};
