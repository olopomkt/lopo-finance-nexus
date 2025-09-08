
// src/pages/Index.tsx (Versão Restaurada)
import { useFinanceData } from "@/hooks/useFinanceData";
import FinancialDashboard from "@/components/charts/FinancialDashboard";
import AdvancedFilterBar from "@/components/filters/AdvancedFilterBar";
import { RecordsView } from "@/components/RecordsView";
import { CompanyRevenue, CompanyExpense, PersonalExpense } from "@/types";

const IndexPage = () => {
  const { combinedData, isLoading, error } = useFinanceData();

  // Handlers vazios para props obrigatórias - podem ser implementados posteriormente se necessário
  const handleEditRevenue = (revenue: CompanyRevenue) => {
    console.log('Edit revenue:', revenue);
  };

  const handleEditCompanyExpense = (expense: CompanyExpense) => {
    console.log('Edit company expense:', expense);
  };

  const handleEditPersonalExpense = (expense: PersonalExpense) => {
    console.log('Edit personal expense:', expense);
  };

  return (
    <div className="space-y-6">
      <FinancialDashboard />
      <div className="p-4 bg-card rounded-lg shadow">
        <AdvancedFilterBar />
        <RecordsView 
          onEditRevenue={handleEditRevenue}
          onEditCompanyExpense={handleEditCompanyExpense}
          onEditPersonalExpense={handleEditPersonalExpense}
        />
      </div>
    </div>
  );
};

export default IndexPage;
