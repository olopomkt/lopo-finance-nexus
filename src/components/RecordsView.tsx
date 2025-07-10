
import { AdvancedFilterBar } from '@/components/filters/AdvancedFilterBar';
import { RevenueList } from '@/components/lists/RevenueList';
import { CompanyExpenseList } from '@/components/lists/CompanyExpenseList';
import { PersonalExpenseList } from '@/components/lists/PersonalExpenseList';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useGlobalFilters } from '@/contexts/FilterContext';
import { useFilteredData } from '@/hooks/useFilteredData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, Wifi, WifiOff, TrendingUp, Building2, User } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  onEditRevenue: (revenue: CompanyRevenue) => void;
  onEditCompanyExpense: (expense: CompanyExpense) => void;
  onEditPersonalExpense: (expense: PersonalExpense) => void;
}

export const RecordsView = ({ 
  onEditRevenue, 
  onEditCompanyExpense, 
  onEditPersonalExpense 
}: Props) => {
  const { companyRevenues, companyExpenses, personalExpenses, isLoading, error, isConnected } = useFinanceData();
  const { filters } = useGlobalFilters();
  
  const { filteredRevenues, filteredCompanyExpenses, filteredPersonalExpenses } = useFilteredData(
    companyRevenues,
    companyExpenses,
    personalExpenses,
    filters
  );

  // Show loading state
  if (isLoading && companyRevenues.length === 0 && companyExpenses.length === 0 && personalExpenses.length === 0) {
    return (
      <div className="space-y-6">
        <AdvancedFilterBar />
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-2 text-muted-foreground">Carregando dados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      {!isConnected && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            Conexão perdida. Tentando reconectar...
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Connection Status Indicator */}
      <div className="flex items-center justify-between">
        <div></div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isConnected ? (
            <>
              <Wifi className="h-3 w-3 text-green-500" />
              <span>Conectado</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-red-500" />
              <span>Desconectado</span>
            </>
          )}
        </div>
      </div>

      {/* Filtro Unificado - UM ÚNICO para todas as categorias */}
      <AdvancedFilterBar />
      
      {/* Tabs para separar as categorias */}
      <Tabs defaultValue="revenues" className="w-full">
        <TabsList className="grid w-full grid-cols-3 border-[2.5px] border-white">
          <TabsTrigger value="revenues" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Receitas Empresariais
          </TabsTrigger>
          <TabsTrigger value="company-expenses" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Despesas Empresariais
          </TabsTrigger>
          <TabsTrigger value="personal-expenses" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Contas Pessoais
          </TabsTrigger>
        </TabsList>

        <TabsContent value="revenues" className="mt-6">
          <div className="border-[2.5px] border-white rounded-lg p-4">
            <RevenueList 
              onEdit={onEditRevenue} 
              revenues={filteredRevenues}
              showHeader={true}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="company-expenses" className="mt-6">
          <div className="border-[2.5px] border-white rounded-lg p-4">
            <CompanyExpenseList 
              onEdit={onEditCompanyExpense}
              expenses={filteredCompanyExpenses}
              showHeader={true}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>

        <TabsContent value="personal-expenses" className="mt-6">
          <div className="border-[2.5px] border-white rounded-lg p-4">
            <PersonalExpenseList 
              onEdit={onEditPersonalExpense}
              expenses={filteredPersonalExpenses}
              showHeader={true}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
