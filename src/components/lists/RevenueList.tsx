
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CompanyRevenue } from '@/types';
import { useFinanceData } from '@/hooks/useFinanceData';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface Props {
  onEdit: (revenue: CompanyRevenue) => void;
  revenues?: CompanyRevenue[];
  showHeader?: boolean;
  isLoading?: boolean;
}

export const RevenueList = ({ onEdit, revenues, showHeader = false, isLoading = false }: Props) => {
  const { deleteRevenue } = useFinanceData();

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await deleteRevenue(id);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Data inválida';
      }
      return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Data inválida';
    }
  };

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-neon-blue">
            <TrendingUp className="h-5 w-5" />
            Receitas Empresariais ({revenues?.length || 0})
          </h3>
          {isLoading && <LoadingSpinner size="sm" />}
        </div>
      )}
      
      <AnimatePresence>
        {!revenues || revenues.length === 0 ? (
          <div className="text-center py-8">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner />
                <span className="text-muted-foreground">Carregando receitas...</span>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nenhuma receita encontrada
              </p>
            )}
          </div>
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
                    <span>{formatDate(revenue.paymentDate)}</span>
                  </div>
                  {revenue.received && (
                    <Badge variant="outline" className="text-green-500 border-green-500/50">
                      Recebido
                    </Badge>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(revenue)}
                      className="h-8 w-8 p-0 hover:bg-neon-blue/20"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(revenue.id)}
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
