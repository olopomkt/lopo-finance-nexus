
import { AdvancedFilterBar } from '@/components/filters/AdvancedFilterBar';
import { RevenueList } from '@/components/lists/RevenueList';
import { CompanyExpenseList } from '@/components/lists/CompanyExpenseList';
import { PersonalExpenseList } from '@/components/lists/PersonalExpenseList';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useGlobalFilters } from '@/contexts/FilterContext';
import { useFilteredData } from '@/hooks/useFilteredData';

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
  const { companyRevenues, companyExpenses, personalExpenses } = useFinanceData();
  const { filters } = useGlobalFilters();
  
  const { filteredRevenues, filteredCompanyExpenses, filteredPersonalExpenses } = useFilteredData(
    companyRevenues,
    companyExpenses,
    personalExpenses,
    filters
  );

  return (
    <div className="space-y-6">
      {/* Filtro Unificado - UM ÚNICO para todas as categorias */}
      <AdvancedFilterBar />
      
      <div className="space-y-8">
        {/* Receitas */}
        <div className="border-[2.5px] border-white rounded-lg p-4">
          <RevenueList 
            onEdit={onEditRevenue} 
            revenues={filteredRevenues}
            showHeader={true}
          />
        </div>

        {/* Despesas Empresariais */}
        <div className="border-[2.5px] border-white rounded-lg p-4">
          <CompanyExpenseList 
            onEdit={onEditCompanyExpense}
            expenses={filteredCompanyExpenses}
            showHeader={true}
          />
        </div>

        {/* Contas Pessoais */}
        <div className="border-[2.5px] border-white rounded-lg p-4">
          <PersonalExpenseList 
            onEdit={onEditPersonalExpense}
            expenses={filteredPersonalExpenses}
            showHeader={true}
          />
        </div>
      </div>
    </div>
  );
};
