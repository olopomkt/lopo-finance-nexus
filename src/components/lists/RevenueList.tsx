
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CompanyRevenue } from '@/types';
import { useFinanceData } from '@/hooks/useFinanceData';
import { toast } from '@/hooks/use-toast';

interface Props {
  onEdit: (revenue: CompanyRevenue) => void;
  revenues?: CompanyRevenue[];
  showHeader?: boolean;
}

export const RevenueList = ({ onEdit, revenues, showHeader = false }: Props) => {
  const { deleteRevenue } = useFinanceData();

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        deleteRevenue(id);
        toast({ title: "Sucesso", description: "Receita excluída com sucesso!" });
      } catch (error) {
        toast({ 
          title: "Erro", 
          description: "Erro ao excluir receita", 
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
        <h3 className="text-lg font-semibold flex items-center gap-2 text-neon-blue">
          <TrendingUp className="h-5 w-5" />
          Receitas Empresariais ({revenues?.length || 0})
        </h3>
      )}
      
      <AnimatePresence>
        {!revenues || revenues.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Nenhuma receita encontrada
          </p>
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
                          <span>{revenue.paymentDate ? format(new Date(revenue.paymentDate), 'dd/MM/yyyy', { locale: ptBR }) : 'Data não informada'}</span>
                        </div>
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
