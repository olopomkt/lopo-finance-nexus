import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, BarChart3, List, Building2, User, TrendingUp } from 'lucide-react';
import { MotivationalQuotes } from '@/components/MotivationalQuotes';
import { FinancialDashboard } from '@/components/charts/FinancialDashboard';
import { RecordsView } from '@/components/RecordsView';
import { CompanyRevenueForm } from '@/components/forms/CompanyRevenueForm';
import { CompanyExpenseForm } from '@/components/forms/CompanyExpenseForm';
import { PersonalExpenseForm } from '@/components/forms/PersonalExpenseForm';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { StarBorder } from '@/components/ui/star-border';
const Index = () => {
  const [activeForm, setActiveForm] = useState<'revenue' | 'company-expense' | 'personal-expense' | null>(null);
  const [editingRevenue, setEditingRevenue] = useState<CompanyRevenue | undefined>();
  const [editingCompanyExpense, setEditingCompanyExpense] = useState<CompanyExpense | undefined>();
  const [editingPersonalExpense, setEditingPersonalExpense] = useState<PersonalExpense | undefined>();
  const handleCloseForm = () => {
    setActiveForm(null);
    setEditingRevenue(undefined);
    setEditingCompanyExpense(undefined);
    setEditingPersonalExpense(undefined);
  };
  const handleEditRevenue = (revenue: CompanyRevenue) => {
    setEditingRevenue(revenue);
    setActiveForm('revenue');
  };
  const handleEditCompanyExpense = (expense: CompanyExpense) => {
    setEditingCompanyExpense(expense);
    setActiveForm('company-expense');
  };
  const handleEditPersonalExpense = (expense: PersonalExpense) => {
    setEditingPersonalExpense(expense);
    setActiveForm('personal-expense');
  };
  return <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <MotivationalQuotes />

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 white-glow-border">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard Financeiro
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Registros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            {/* Botões de Ação com StarBorder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StarBorder as="div" className="cursor-pointer" onClick={() => setActiveForm('revenue')}>
                <div className="flex flex-col items-center space-y-3 p-6">
                  <div className="p-3 rounded-full bg-zinc-600/20 group-hover:bg-zinc-400/30 transition-colors">
                    <TrendingUp className="h-6 w-6 text-zinc-100" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-600">Nova Receita</h3>
                    <p className="text-sm text-muted-foreground">Empresarial</p>
                  </div>
                </div>
              </StarBorder>

              <StarBorder as="div" className="cursor-pointer" onClick={() => setActiveForm('company-expense')}>
                <div className="flex flex-col items-center space-y-3 p-6">
                  <div className="p-3 rounded-full bg-zinc-600/20 group-hover:bg-zinc-400/30 transition-colors">
                    <Building2 className="h-6 w-6 text-zinc-100" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-400">Nova Despesa</h3>
                    <p className="text-sm text-muted-foreground">Empresarial</p>
                  </div>
                </div>
              </StarBorder>

              <StarBorder as="div" className="cursor-pointer" onClick={() => setActiveForm('personal-expense')}>
                <div className="flex flex-col items-center space-y-3 p-6">
                  <div className="p-3 rounded-full bg-zinc-600/20 group-hover:bg-zinc-400/30 transition-colors">
                    <User className="h-6 w-6 text-zinc-100" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neon-purple">Nova Conta</h3>
                    <p className="text-sm text-muted-foreground">Pessoal</p>
                  </div>
                </div>
              </StarBorder>
            </div>

            {/* Componente de Registros com bordas brancas */}
            <div className="white-glow-border rounded-lg p-4">
              <RecordsView onEditRevenue={handleEditRevenue} onEditCompanyExpense={handleEditCompanyExpense} onEditPersonalExpense={handleEditPersonalExpense} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Formulários Modais */}
        <AnimatePresence>
          {activeForm === 'revenue' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={e => e.target === e.currentTarget && handleCloseForm()}>
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CompanyRevenueForm revenue={editingRevenue} onSave={handleCloseForm} onCancel={handleCloseForm} />
              </div>
            </motion.div>}

          {activeForm === 'company-expense' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={e => e.target === e.currentTarget && handleCloseForm()}>
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CompanyExpenseForm expense={editingCompanyExpense} onSave={handleCloseForm} onCancel={handleCloseForm} />
              </div>
            </motion.div>}

          {activeForm === 'personal-expense' && <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={e => e.target === e.currentTarget && handleCloseForm()}>
              <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <PersonalExpenseForm expense={editingPersonalExpense} onSave={handleCloseForm} onCancel={handleCloseForm} />
              </div>
            </motion.div>}
        </AnimatePresence>
      </div>
    </div>;
};
export default Index;