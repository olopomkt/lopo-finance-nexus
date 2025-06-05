
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, List } from 'lucide-react';
import { CompanyRevenueForm } from '@/components/forms/CompanyRevenueForm';
import { CompanyExpenseForm } from '@/components/forms/CompanyExpenseForm';
import { PersonalExpenseForm } from '@/components/forms/PersonalExpenseForm';
import { TransactionList } from '@/components/lists/TransactionList';
import { Dashboard } from '@/components/charts/Dashboard';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';

type FormType = 'revenue' | 'company-expense' | 'personal-expense' | null;
type ViewType = 'dashboard' | 'list';

export default function Index() {
  const [currentForm, setCurrentForm] = useState<FormType>(null);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [editingRevenue, setEditingRevenue] = useState<CompanyRevenue | undefined>();
  const [editingCompanyExpense, setEditingCompanyExpense] = useState<CompanyExpense | undefined>();
  const [editingPersonalExpense, setEditingPersonalExpense] = useState<PersonalExpense | undefined>();

  const handleSave = () => {
    setCurrentForm(null);
    setEditingRevenue(undefined);
    setEditingCompanyExpense(undefined);
    setEditingPersonalExpense(undefined);
  };

  const handleCancel = () => {
    setCurrentForm(null);
    setEditingRevenue(undefined);
    setEditingCompanyExpense(undefined);
    setEditingPersonalExpense(undefined);
  };

  const handleEditRevenue = (revenue: CompanyRevenue) => {
    setEditingRevenue(revenue);
    setCurrentForm('revenue');
  };

  const handleEditCompanyExpense = (expense: CompanyExpense) => {
    setEditingCompanyExpense(expense);
    setCurrentForm('company-expense');
  };

  const handleEditPersonalExpense = (expense: PersonalExpense) => {
    setEditingPersonalExpense(expense);
    setCurrentForm('personal-expense');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
              Controle de Custo MLN
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentForm ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {currentForm === 'revenue' && (
                <CompanyRevenueForm
                  revenue={editingRevenue}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              )}
              {currentForm === 'company-expense' && (
                <CompanyExpenseForm
                  expense={editingCompanyExpense}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              )}
              {currentForm === 'personal-expense' && (
                <PersonalExpenseForm
                  expense={editingPersonalExpense}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setCurrentForm('revenue')}
                    className="bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white shadow-lg hover:shadow-neon-blue/25"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Receita
                  </Button>
                  <Button
                    onClick={() => setCurrentForm('company-expense')}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-red-500/25"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Despesa Empresarial
                  </Button>
                  <Button
                    onClick={() => setCurrentForm('personal-expense')}
                    className="bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 text-white shadow-lg hover:shadow-neon-purple/25"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Conta Pessoal
                  </Button>
                </div>

                {/* View Toggle */}
                <div className="flex rounded-lg border border-border/50 bg-card/30 p-1">
                  <Button
                    variant={currentView === 'dashboard' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('dashboard')}
                    className={currentView === 'dashboard' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant={currentView === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('list')}
                    className={currentView === 'list' ? 'bg-primary text-primary-foreground' : ''}
                  >
                    <List className="mr-2 h-4 w-4" />
                    Lista
                  </Button>
                </div>
              </div>

              {/* Content */}
              <AnimatePresence mode="wait">
                {currentView === 'dashboard' ? (
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Dashboard />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TransactionList
                      onEditRevenue={handleEditRevenue}
                      onEditCompanyExpense={handleEditCompanyExpense}
                      onEditPersonalExpense={handleEditPersonalExpense}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
