
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Building2, User } from 'lucide-react';
import { RevenueList } from '@/components/lists/RevenueList';
import { CompanyExpenseList } from '@/components/lists/CompanyExpenseList';
import { PersonalExpenseList } from '@/components/lists/PersonalExpenseList';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';

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
  return (
    <div className="space-y-6">
      <Tabs defaultValue="revenues" className="w-full">
        <TabsList className="grid w-full grid-cols-3 white-glow-border">
          <TabsTrigger value="revenues" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Receitas
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
          <div className="white-glow-border rounded-lg p-4">
            <RevenueList onEdit={onEditRevenue} />
          </div>
        </TabsContent>

        <TabsContent value="company-expenses" className="mt-6">
          <div className="white-glow-border rounded-lg p-4">
            <CompanyExpenseList onEdit={onEditCompanyExpense} />
          </div>
        </TabsContent>

        <TabsContent value="personal-expenses" className="mt-6">
          <div className="white-glow-border rounded-lg p-4">
            <PersonalExpenseList onEdit={onEditPersonalExpense} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
