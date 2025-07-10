
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PersonalExpense } from '@/types';
import { useFinanceData } from '@/hooks/useFinanceData';
import { toast } from '@/hooks/use-toast';

interface Props {
  onEdit: (expense: PersonalExpense) => void;
  expenses?: PersonalExpense[];
  showHeader?: boolean;
}

export const PersonalExpenseList = ({ onEdit, expenses, showHeader = false }: Props) => {
  const { deletePersonalExpense } = useFinanceData();

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        deletePersonalExpense(id);
        toast({ title: "Sucesso", description: "Conta excluída com sucesso!" });
      } catch (error) {
        toast({ 
          title: "Erro", 
          description: "Erro ao excluir conta", 
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
        <h3 className="text-lg font-semibold flex items-center gap-2 text-neon-purple">
          <User className="h-5 w-5" />
          <TrendingDown className="h-5 w-5" />
          Contas Pessoais ({expenses?.length || 0})
        </h3>
      )}
      
      <AnimatePresence>
        {!expenses || expenses.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma conta encontrada
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenses.map((expense) => (
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
                      onClick={() => onEdit(expense)}
                      className="h-8 w-8 p-0 hover:bg-neon-purple/20"
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
