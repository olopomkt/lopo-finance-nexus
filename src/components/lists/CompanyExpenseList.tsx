
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Building2, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CompanyExpense } from '@/types';
import { useFinanceData } from '@/hooks/useFinanceData';
import { toast } from '@/hooks/use-toast';

interface Props {
  onEdit: (expense: CompanyExpense) => void;
  expenses?: CompanyExpense[];
  showHeader?: boolean;
}

export const CompanyExpenseList = ({ onEdit, expenses, showHeader = false }: Props) => {
  const { deleteCompanyExpense } = useFinanceData();

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        deleteCompanyExpense(id);
        toast({ title: "Sucesso", description: "Despesa excluída com sucesso!" });
      } catch (error) {
        toast({ 
          title: "Erro", 
          description: "Erro ao excluir despesa", 
          variant: "destructive" 
        });
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <h3 className="text-lg font-semibold flex items-center gap-2 text-red-400">
          <Building2 className="h-5 w-5" />
          <TrendingDown className="h-5 w-5" />
          Despesas Empresariais ({expenses?.length || 0})
        </h3>
      )}
      
      <AnimatePresence>
        {!expenses || expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma despesa encontrada
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenses.map((expense) => (
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
                      onClick={() => onEdit(expense)}
                      className="h-8 w-8 p-0 hover:bg-red-400/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(expense.id)}
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
    </div>
  );
};
