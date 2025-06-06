
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Edit, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CompanyRevenue } from '@/types';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { FilterBar } from '@/components/filters/FilterBar';
import { toast } from '@/hooks/use-toast';

interface Props {
  onEdit: (revenue: CompanyRevenue) => void;
}

export const RevenueList = ({ onEdit }: Props) => {
  const { companyRevenues, confirmReceived } = useFinanceData();
  const { filters, filterTransactions, setFilter, clearFilters } = useTransactionFilters();

  const filteredRevenues = filterTransactions(companyRevenues, 'revenue');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleConfirmReceived = async (id: string) => {
    try {
      await confirmReceived(id);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao confirmar recebimento",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neon-blue flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Receitas Empresariais ({filteredRevenues.length})
        </h2>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={setFilter}
        onClearFilters={clearFilters}
        showPaymentMethodFilter={true}
      />

      <div className="grid gap-4">
        {filteredRevenues.length === 0 ? (
          <Card className="neon-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhuma receita encontrada</p>
            </CardContent>
          </Card>
        ) : (
          filteredRevenues.map((revenue) => (
            <Card key={revenue.id} className="neon-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-neon-blue">{revenue.clientName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{revenue.service}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={revenue.received ? "default" : "secondary"} className="text-xs">
                      {revenue.received ? "Recebido" : "Pendente"}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(revenue)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <p className="font-semibold text-neon-blue">{formatCurrency(revenue.price)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pagamento:</span>
                    <p>{revenue.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data:</span>
                    <p>{format(revenue.paymentDate, 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conta:</span>
                    <p>{revenue.accountType}</p>
                  </div>
                </div>
                {!revenue.received && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConfirmReceived(revenue.id)}
                      className="text-green-500 border-green-500 hover:bg-green-500/10"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Recebimento
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
