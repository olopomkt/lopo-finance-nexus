import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Building2, User, BarChart3, FileText } from 'lucide-react';
import { Header } from '@/components/Header';
import { CompanyRevenueForm } from '@/components/forms/CompanyRevenueForm';
import { CompanyExpenseForm } from '@/components/forms/CompanyExpenseForm';
import { PersonalExpenseForm } from '@/components/forms/PersonalExpenseForm';
import { TransactionList } from '@/components/lists/TransactionList';
import { Dashboard } from '@/components/charts/Dashboard';
import { ReportsPanel } from '@/components/reports/ReportsPanel';
import { Toaster } from '@/components/ui/toaster';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { useFinanceData } from '@/hooks/useFinanceData';

type FormType = 'revenue' | 'company-expense' | 'personal-expense' | null;

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeForm, setActiveForm] = useState<FormType>(null);
  const [editingRevenue, setEditingRevenue] = useState<CompanyRevenue | undefined>();
  const [editingCompanyExpense, setEditingCompanyExpense] = useState<CompanyExpense | undefined>();
  const [editingPersonalExpense, setEditingPersonalExpense] = useState<PersonalExpense | undefined>();

  const { companyRevenues, companyExpenses, personalExpenses } = useFinanceData();

  const handleFormSave = () => {
    setActiveForm(null);
    setEditingRevenue(undefined);
    setEditingCompanyExpense(undefined);
    setEditingPersonalExpense(undefined);
  };

  const handleFormCancel = () => {
    setActiveForm(null);
    setEditingRevenue(undefined);
    setEditingCompanyExpense(undefined);
    setEditingPersonalExpense(undefined);
  };

  const handleEditRevenue = (revenue: CompanyRevenue) => {
    setEditingRevenue(revenue);
    setActiveForm('revenue');
    setActiveTab('empresa');
  };

  const handleEditCompanyExpense = (expense: CompanyExpense) => {
    setEditingCompanyExpense(expense);
    setActiveForm('company-expense');
    setActiveTab('empresa');
  };

  const handleEditPersonalExpense = (expense: PersonalExpense) => {
    setEditingPersonalExpense(expense);
    setActiveForm('personal-expense');
    setActiveTab('pessoal');
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-8"
          >
            <TabsList className="glass-effect border border-neon-blue/20">
              <TabsTrigger 
                value="dashboard" 
                className="data-[state=active]:bg-neon-blue/20 data-[state=active]:text-neon-blue"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="empresa" 
                className="data-[state=active]:bg-neon-blue/20 data-[state=active]:text-neon-blue"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Empresa
              </TabsTrigger>
              <TabsTrigger 
                value="pessoal" 
                className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple"
              >
                <User className="h-4 w-4 mr-2" />
                Pessoal
              </TabsTrigger>
              <TabsTrigger 
                value="registros" 
                className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
              >
                Registros
              </TabsTrigger>
              <TabsTrigger 
                value="relatorios" 
                className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple"
              >
                <FileText className="h-4 w-4 mr-2" />
                Relatórios
              </TabsTrigger>
            </TabsList>

            {activeTab !== 'dashboard' && activeTab !== 'registros' && activeTab !== 'relatorios' && (
              <div className="flex gap-2">
                {activeTab === 'empresa' && (
                  <>
                    <Button
                      onClick={() => setActiveForm('revenue')}
                      className="bg-gradient-to-r from-neon-blue to-neon-cyan hover:from-neon-blue/80 hover:to-neon-cyan/80 text-white neon-glow"
                      disabled={activeForm !== null}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Receita
                    </Button>
                    <Button
                      onClick={() => setActiveForm('company-expense')}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                      disabled={activeForm !== null}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Despesa
                    </Button>
                  </>
                )}
                {activeTab === 'pessoal' && (
                  <Button
                    onClick={() => setActiveForm('personal-expense')}
                    className="bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 text-white neon-glow"
                    disabled={activeForm !== null}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Conta
                  </Button>
                )}
              </div>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            <TabsContent value="dashboard" className="mt-6">
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard />
              </motion.div>
            </TabsContent>

            <TabsContent value="empresa" className="mt-6">
              <motion.div
                key="empresa"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <AnimatePresence>
                  {activeForm === 'revenue' && (
                    <CompanyRevenueForm
                      revenue={editingRevenue}
                      onSave={handleFormSave}
                      onCancel={handleFormCancel}
                    />
                  )}
                  {activeForm === 'company-expense' && (
                    <CompanyExpenseForm
                      expense={editingCompanyExpense}
                      onSave={handleFormSave}
                      onCancel={handleFormCancel}
                    />
                  )}
                </AnimatePresence>

                {activeForm === null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <Building2 className="h-16 w-16 mx-auto text-neon-blue/50 mb-4" />
                    <h3 className="text-xl font-semibold text-neon-blue mb-2">Gestão Empresarial</h3>
                    <p className="text-muted-foreground mb-6">
                      Cadastre receitas e despesas da sua empresa para manter o controle financeiro
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => setActiveForm('revenue')}
                        className="bg-gradient-to-r from-neon-blue to-neon-cyan hover:from-neon-blue/80 hover:to-neon-cyan/80 text-white animate-pulse-neon"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Receita
                      </Button>
                      <Button
                        onClick={() => setActiveForm('company-expense')}
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Cadastrar Despesa
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="pessoal" className="mt-6">
              <motion.div
                key="pessoal"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <AnimatePresence>
                  {activeForm === 'personal-expense' && (
                    <PersonalExpenseForm
                      expense={editingPersonalExpense}
                      onSave={handleFormSave}
                      onCancel={handleFormCancel}
                    />
                  )}
                </AnimatePresence>

                {activeForm === null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <User className="h-16 w-16 mx-auto text-neon-purple/50 mb-4" />
                    <h3 className="text-xl font-semibold text-neon-purple mb-2">Contas Pessoais</h3>
                    <p className="text-muted-foreground mb-6">
                      Gerencie suas contas pessoais e mantenha suas finanças organizadas
                    </p>
                    <Button
                      onClick={() => setActiveForm('personal-expense')}
                      className="bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 text-white animate-pulse-neon"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Conta
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="registros" className="mt-6">
              <motion.div
                key="registros"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <TransactionList
                  onEditRevenue={handleEditRevenue}
                  onEditCompanyExpense={handleEditCompanyExpense}
                  onEditPersonalExpense={handleEditPersonalExpense}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="relatorios" className="mt-6">
              <motion.div
                key="relatorios"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ReportsPanel
                  revenues={companyRevenues}
                  companyExpenses={companyExpenses}
                  personalExpenses={personalExpenses}
                />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
      
      <Toaster />
    </div>
  );
};

export default Index;
