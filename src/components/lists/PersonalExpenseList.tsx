
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, User, TrendingDown } from 'lucide-react';
import { PersonalExpense } from '@/types';
import { useFinanceData } from '@/hooks/useFinanceData';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatCurrency, formatDate } from '@/lib/dateUtils';

interface Props {
  onEdit: (expense: PersonalExpense) => void;
  expenses?: PersonalExpense[];
  showHeader?: boolean;
  isLoading?: boolean;
}

export const PersonalExpenseList = ({ onEdit, expenses, showHeader = false, isLoading = false }: Props) => {
  const { deletePersonalExpense } = useFinanceData();

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      try {
        await deletePersonalExpense(id);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-neon-purple">
            <User className="h-5 w-5" />
            <TrendingDown className="h-5 w-5" />
            Contas Pessoais ({expenses?.length || 0})
          </h3>
          {isLoading && <LoadingSpinner size="sm" />}
        </div>
      )}
      
      <AnimatePresence>
        {!expenses || expenses.length === 0 ? (
          <div className="text-center py-8">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                <span className="text-muted-foreground">Carregando contas...</span>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nenhuma conta encontrada
              </p>
            )}
          </div>
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
                  <p className="text-xs text-muted-foreground">
                    {formatDate(expense.paymentDate)}
                  </p>
                  {expense.observation && (
                    <p className="text-xs text-muted-foreground italic">{expense.observation}</p>
                  )}
                  {expense.paid && (
                    <Badge variant="outline" className="text-green-500 border-green-500/50">
                      Pago
                    </Badge>
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
