
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types/finance';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthlyReportProps {
  companyRevenues: CompanyRevenue[];
  companyExpenses: CompanyExpense[];
  personalExpenses: PersonalExpense[];
  selectedDate?: Date;
}

export const MonthlyReport = ({ 
  companyRevenues, 
  companyExpenses, 
  personalExpenses,
  selectedDate = new Date()
}: MonthlyReportProps) => {
  const report = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    // Filtrar dados do mês
    const monthRevenues = companyRevenues.filter(revenue => 
      revenue.paymentDate >= monthStart && revenue.paymentDate <= monthEnd
    );
    const monthCompanyExpenses = companyExpenses.filter(expense => 
      expense.paymentDate >= monthStart && expense.paymentDate <= monthEnd
    );
    const monthPersonalExpenses = personalExpenses.filter(expense => 
      expense.paymentDate >= monthStart && expense.paymentDate <= monthEnd
    );

    // Cálculos de receita
    const totalRevenue = monthRevenues.reduce((sum, revenue) => sum + revenue.price, 0);
    const receivedRevenue = monthRevenues
      .filter(revenue => revenue.received)
      .reduce((sum, revenue) => sum + revenue.price, 0);
    const pendingRevenue = totalRevenue - receivedRevenue;

    // Cálculos de despesas
    const totalCompanyExpenses = monthCompanyExpenses.reduce((sum, expense) => sum + expense.price, 0);
    const totalPersonalExpenses = monthPersonalExpenses.reduce((sum, expense) => sum + expense.price, 0);
    const totalExpenses = totalCompanyExpenses + totalPersonalExpenses;

    const paidCompanyExpenses = monthCompanyExpenses
      .filter(expense => expense.paid)
      .reduce((sum, expense) => sum + expense.price, 0);
    const paidPersonalExpenses = monthPersonalExpenses
      .filter(expense => expense.paid)
      .reduce((sum, expense) => sum + expense.price, 0);
    const totalPaidExpenses = paidCompanyExpenses + paidPersonalExpenses;
    const pendingExpenses = totalExpenses - totalPaidExpenses;

    // Análise por categorias
    const revenueByAccount = monthRevenues.reduce((acc, revenue) => {
      acc[revenue.accountType] = (acc[revenue.accountType] || 0) + revenue.price;
      return acc;
    }, {} as Record<string, number>);

    const expensesByPaymentMethod = monthCompanyExpenses.reduce((acc, expense) => {
      acc[expense.paymentMethod] = (acc[expense.paymentMethod] || 0) + expense.price;
      return acc;
    }, {} as Record<string, number>);

    // Contratos mensais vs únicos
    const monthlyContracts = monthRevenues.filter(revenue => revenue.contractType === 'mensal');
    const oneTimeContracts = monthRevenues.filter(revenue => revenue.contractType === 'único');

    return {
      period: format(selectedDate, 'MMMM yyyy', { locale: ptBR }),
      revenue: {
        total: totalRevenue,
        received: receivedRevenue,
        pending: pendingRevenue,
        receivedPercentage: totalRevenue > 0 ? (receivedRevenue / totalRevenue) * 100 : 0,
        byAccount: revenueByAccount,
        monthlyContracts: monthlyContracts.length,
        oneTimeContracts: oneTimeContracts.length
      },
      expenses: {
        total: totalExpenses,
        company: totalCompanyExpenses,
        personal: totalPersonalExpenses,
        paid: totalPaidExpenses,
        pending: pendingExpenses,
        paidPercentage: totalExpenses > 0 ? (totalPaidExpenses / totalExpenses) * 100 : 0,
        byPaymentMethod: expensesByPaymentMethod
      },
      profit: {
        gross: totalRevenue - totalExpenses,
        net: receivedRevenue - totalPaidExpenses
      },
      counts: {
        revenues: monthRevenues.length,
        companyExpenses: monthCompanyExpenses.length,
        personalExpenses: monthPersonalExpenses.length
      }
    };
  }, [companyRevenues, companyExpenses, personalExpenses, selectedDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Relatório */}
      <Card className="neon-border bg-gradient-to-r from-neon-blue/10 to-neon-purple/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6" />
            Relatório Mensal - {report.period}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-blue">
                {formatCurrency(report.revenue.total)}
              </div>
              <div className="text-sm text-muted-foreground">Receita Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">
                {formatCurrency(report.expenses.total)}
              </div>
              <div className="text-sm text-muted-foreground">Despesas Total</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${report.profit.net >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(report.profit.net)}
              </div>
              <div className="text-sm text-muted-foreground">Lucro Líquido</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análise de Receitas */}
        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-blue">
              <TrendingUp className="h-5 w-5" />
              Análise de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Taxa de Recebimento</span>
                <span className="text-sm text-muted-foreground">
                  {report.revenue.receivedPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={report.revenue.receivedPercentage} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Recebido</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{formatCurrency(report.revenue.received)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pendente</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{formatCurrency(report.revenue.pending)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Por Tipo de Conta</h4>
              <div className="space-y-2">
                {Object.entries(report.revenue.byAccount).map(([account, value]) => (
                  <div key={account} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{account}</span>
                    <span className="font-medium">{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Tipos de Contrato</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-neon-purple">
                    {report.revenue.monthlyContracts}
                  </div>
                  <div className="text-xs text-muted-foreground">Mensais</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-500">
                    {report.revenue.oneTimeContracts}
                  </div>
                  <div className="text-xs text-muted-foreground">Únicos</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Análise de Despesas */}
        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <TrendingDown className="h-5 w-5" />
              Análise de Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Taxa de Pagamento</span>
                <span className="text-sm text-muted-foreground">
                  {report.expenses.paidPercentage.toFixed(1)}%
                </span>
              </div>
              <Progress value={report.expenses.paidPercentage} className="h-2" />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pago</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{formatCurrency(report.expenses.paid)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pendente</span>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">{formatCurrency(report.expenses.pending)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Por Categoria</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Empresarial</span>
                  <span className="font-medium">{formatCurrency(report.expenses.company)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pessoal</span>
                  <span className="font-medium">{formatCurrency(report.expenses.personal)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Por Método de Pagamento</h4>
              <div className="space-y-2">
                {Object.entries(report.expenses.byPaymentMethod).map(([method, value]) => (
                  <div key={method} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{method}</span>
                    <span className="font-medium">{formatCurrency(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Transações */}
      <Card className="neon-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Resumo de Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-xl font-bold text-neon-blue">
                {report.counts.revenues}
              </div>
              <div className="text-sm text-muted-foreground">Receitas</div>
            </div>
            <div>
              <div className="text-xl font-bold text-red-500">
                {report.counts.companyExpenses}
              </div>
              <div className="text-sm text-muted-foreground">Despesas Empresariais</div>
            </div>
            <div>
              <div className="text-xl font-bold text-neon-purple">
                {report.counts.personalExpenses}
              </div>
              <div className="text-sm text-muted-foreground">Contas Pessoais</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
