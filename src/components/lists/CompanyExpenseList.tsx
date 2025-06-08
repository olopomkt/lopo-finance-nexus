
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Edit, CheckCircle } from 'lucide-react';
import { CompanyExpense } from '@/types/finance';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useUnifiedFilters } from '@/hooks/useUnifiedFilters';
import { FilterBar } from '@/components/filters/FilterBar';
import { dateTransformers, formatCurrency } from '@/lib/dateUtils';
import { toast } from '@/hooks/use-toast';

interface Props {
  onEdit: (expense: CompanyExpense) => void;
}

export const CompanyExpenseList = ({ onEdit }: Props) => {
  const { companyExpenses, confirmPayment } = useFinanceData();
  const { filters, filterTransactions, updateFilter, clearFilters } = useUnifiedFilters();
  
  const filteredExpenses = filterTransactions(companyExpenses, 'expense');

  const handleConfirmPayment = async (id: string) => {
    try {
      await confirmPayment(id, 'company');
      toast({
        title: "Sucesso",
        description: "Pagamento confirmado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao confirmar pagamento",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-neutral-300">
          <Building2 className="h-6 w-6" />
          Despesas Empresariais ({filteredExpenses.length})
        </h2>
      </div>

      <FilterBar filters={filters} onFilterChange={updateFilter} onClearFilters={clearFilters} showPaymentMethodFilter={true} />

      <div className="grid gap-4">
        {filteredExpenses.length === 0 ? (
          <Card className="border-2 border-white bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhuma despesa encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <Card key={expense.id} className="border-2 border-white bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-neutral-300 font-bold">{expense.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{expense.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={expense.paid ? "default" : "secondary"} className="text-xs">
                      {expense.paid ? "Pago" : "Pendente"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground font-bold">Valor:</span>
                    <p className="font-semibold text-red-400">{formatCurrency(expense.price)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-bold">Pagamento:</span>
                    <p>{expense.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-bold">Data:</span>
                    <p>{dateTransformers.formatDisplay(expense.paymentDate)}</p>
                  </div>
                </div>
                {!expense.paid && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConfirmPayment(expense.id)}
                      className="text-green-500 border-green-500 hover:bg-green-500/10"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Pagamento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
