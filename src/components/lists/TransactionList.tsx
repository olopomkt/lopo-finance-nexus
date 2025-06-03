
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Building2, User, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { storageService } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

interface Props {
  onEditRevenue: (revenue: CompanyRevenue) => void;
  onEditCompanyExpense: (expense: CompanyExpense) => void;
  onEditPersonalExpense: (expense: PersonalExpense) => void;
}

export const TransactionList = ({ onEditRevenue, onEditCompanyExpense, onEditPersonalExpense }: Props) => {
  const [revenues, setRevenues] = useState<CompanyRevenue[]>(storageService.getCompanyRevenues());
  const [companyExpenses, setCompanyExpenses] = useState<CompanyExpense[]>(storageService.getCompanyExpenses());
  const [personalExpenses, setPersonalExpenses] = useState<PersonalExpense[]>(storageService.getPersonalExpenses());

  const refreshData = () => {
    setRevenues(storageService.getCompanyRevenues());
    setCompanyExpenses(storageService.getCompanyExpenses());
    setPersonalExpenses(storageService.getPersonalExpenses());
  };

  const deleteRevenue = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      storageService.deleteCompanyRevenue(id);
      refreshData();
      toast({ title: "Sucesso", description: "Receita excluída com sucesso!" });
    }
  };

  const deleteCompanyExpense = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      storageService.deleteCompanyExpense(id);
      refreshData();
      toast({ title: "Sucesso", description: "Despesa excluída com sucesso!" });
    }
  };

  const deletePersonalExpense = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      storageService.deletePersonalExpense(id);
      refreshData();
      toast({ title: "Sucesso", description: "Conta excluída com sucesso!" });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Company Revenues */}
      <Card className="neon-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-blue">
            <Building2 className="h-5 w-5" />
            <TrendingUp className="h-5 w-5" />
            Receitas Empresariais ({revenues.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {revenues.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma receita cadastrada</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {revenues.map((revenue) => (
                  <motion.div
                    key={revenue.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-effect p-4 rounded-lg border border-neon-blue/20 hover:border-neon-blue/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-sm">{revenue.clientName}</h4>
                        <Badge variant="outline" className="text-neon-blue border-neon-blue/50">
                          {revenue.contractType}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{revenue.service}</p>
                      <p className="text-lg font-bold text-neon-blue">{formatCurrency(revenue.price)}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{revenue.paymentMethod}</span>
                        <span>{format(revenue.paymentDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditRevenue(revenue)}
                          className="h-8 w-8 p-0 hover:bg-neon-blue/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteRevenue(revenue.id)}
                          className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Company Expenses */}
      <Card className="neon-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <Building2 className="h-5 w-5" />
            <TrendingDown className="h-5 w-5" />
            Despesas Empresariais ({companyExpenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {companyExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma despesa cadastrada</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {companyExpenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-effect p-4 rounded-lg border border-red-400/20 hover:border-red-400/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-sm">{expense.name}</h4>
                        <Badge variant="outline" className="text-red-400 border-red-400/50">
                          {expense.type}
                        </Badge>
                      </div>
                      <p className="text-lg font-bold text-red-400">{formatCurrency(expense.price)}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{expense.paymentMethod}</span>
                        <span>{format(expense.paymentDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditCompanyExpense(expense)}
                          className="h-8 w-8 p-0 hover:bg-red-400/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteCompanyExpense(expense.id)}
                          className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Personal Expenses */}
      <Card className="neon-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-purple">
            <User className="h-5 w-5" />
            <TrendingDown className="h-5 w-5" />
            Contas Pessoais ({personalExpenses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence>
            {personalExpenses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma conta cadastrada</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {personalExpenses.map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-effect p-4 rounded-lg border border-neon-purple/20 hover:border-neon-purple/40 transition-colors"
                  >
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">{expense.name}</h4>
                      <p className="text-lg font-bold text-neon-purple">{formatCurrency(expense.price)}</p>
                      <p className="text-xs text-muted-foreground">{format(expense.paymentDate, 'dd/MM/yyyy', { locale: ptBR })}</p>
                      {expense.observation && (
                        <p className="text-xs text-muted-foreground italic">{expense.observation}</p>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditPersonalExpense(expense)}
                          className="h-8 w-8 p-0 hover:bg-neon-purple/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePersonalExpense(expense.id)}
                          className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};
