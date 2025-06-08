import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Edit, CheckCircle } from 'lucide-react';
import { CompanyRevenue } from '@/types/finance';
import { useFinanceData } from '@/hooks/useFinanceData';
import { useUnifiedFilters } from '@/hooks/useUnifiedFilters';
import { FilterBar } from '@/components/filters/FilterBar';
import { dateTransformers, formatCurrency } from '@/lib/dateUtils';
import { toast } from '@/hooks/use-toast';
interface Props {
  onEdit: (revenue: CompanyRevenue) => void;
}
export const RevenueList = ({
  onEdit
}: Props) => {
  const {
    companyRevenues,
    confirmReceived
  } = useFinanceData();
  const {
    filters,
    filterTransactions,
    updateFilter,
    clearFilters
  } = useUnifiedFilters();
  const filteredRevenues = filterTransactions(companyRevenues, 'revenue');
  const handleConfirmReceived = async (id: string) => {
    try {
      await confirmReceived(id);
      toast({
        title: "Sucesso",
        description: "Recebimento confirmado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao confirmar recebimento",
        variant: "destructive"
      });
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl flex items-center gap-2 font-bold text-neutral-300">
          <TrendingUp className="h-6 w-6" />
          Receitas Empresariais ({filteredRevenues.length})
        </h2>
      </div>

      <FilterBar filters={filters} onFilterChange={updateFilter} onClearFilters={clearFilters} showPaymentMethodFilter={true} />

      <div className="grid gap-4">
        {filteredRevenues.length === 0 ? <Card className="neon-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhuma receita encontrada</p>
            </CardContent>
          </Card> : filteredRevenues.map(revenue => <Card key={revenue.id} className="neon-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-slate-50 font-extrabold">{revenue.clientName}</CardTitle>
                    <p className="text-neutral-400 text-sm">{revenue.service}</p>
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
                    <span className="font-bold text-neutral-400">Valor:</span>
                    <p className="text-green-500 font-bold">{formatCurrency(revenue.price)}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold">Pagamento:</span>
                    <p className="text-slate-50">{revenue.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold">Data:</span>
                    <p>{dateTransformers.formatDisplay(revenue.paymentDate)}</p>
                  </div>
                  <div>
                    <span className="text-neutral-400 font-bold ">Conta:</span>
                    <p>{revenue.accountType}</p>
                  </div>
                </div>
                {!revenue.received && <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleConfirmReceived(revenue.id)} className="text-green-500 border-green-500 hover:bg-green-500/10">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirmar Recebimento
                    </Button>
                  </div>}
              </CardContent>
            </Card>)}
      </div>
    </div>;
};