
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  CreditCard,
  Target,
  Calendar,
  Percent,
  BarChart3
} from 'lucide-react';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types/finance';
import { format, startOfMonth, endOfMonth, subMonths, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialMetricsProps {
  companyRevenues: CompanyRevenue[];
  companyExpenses: CompanyExpense[];
  personalExpenses: PersonalExpense[];
}

export const FinancialMetrics = ({ companyRevenues, companyExpenses, personalExpenses }: FinancialMetricsProps) => {
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const lastMonthEnd = endOfMonth(subMonths(now, 1));

    // Receitas do mês atual
    const currentMonthRevenues = companyRevenues.filter(revenue => 
      revenue.paymentDate >= currentMonthStart && revenue.paymentDate <= currentMonthEnd
    );
    const currentMonthRevenueTotal = currentMonthRevenues.reduce((sum, revenue) => sum + revenue.price, 0);
    const currentMonthReceivedTotal = currentMonthRevenues
      .filter(revenue => revenue.received)
      .reduce((sum, revenue) => sum + revenue.price, 0);

    // Receitas do mês passado
    const lastMonthRevenues = companyRevenues.filter(revenue => 
      revenue.paymentDate >= lastMonthStart && revenue.paymentDate <= lastMonthEnd
    );
    const lastMonthRevenueTotal = lastMonthRevenues.reduce((sum, revenue) => sum + revenue.price, 0);

    // Despesas do mês atual
    const currentMonthCompanyExpenses = companyExpenses.filter(expense => 
      expense.paymentDate >= currentMonthStart && expense.paymentDate <= currentMonthEnd
    );
    const currentMonthPersonalExpenses = personalExpenses.filter(expense => 
      expense.paymentDate >= currentMonthStart && expense.paymentDate <= currentMonthEnd
    );
    
    const currentMonthExpensesTotal = 
      currentMonthCompanyExpenses.reduce((sum, expense) => sum + expense.price, 0) +
      currentMonthPersonalExpenses.reduce((sum, expense) => sum + expense.price, 0);

    const currentMonthPaidExpensesTotal = 
      currentMonthCompanyExpenses.filter(expense => expense.paid).reduce((sum, expense) => sum + expense.price, 0) +
      currentMonthPersonalExpenses.filter(expense => expense.paid).reduce((sum, expense) => sum + expense.price, 0);

    // Despesas do mês passado
    const lastMonthCompanyExpenses = companyExpenses.filter(expense => 
      expense.paymentDate >= lastMonthStart && expense.paymentDate <= lastMonthEnd
    );
    const lastMonthPersonalExpenses = personalExpenses.filter(expense => 
      expense.paymentDate >= lastMonthStart && expense.paymentDate <= lastMonthEnd
    );
    const lastMonthExpensesTotal = 
      lastMonthCompanyExpenses.reduce((sum, expense) => sum + expense.price, 0) +
      lastMonthPersonalExpenses.reduce((sum, expense) => sum + expense.price, 0);

    // Cálculos de variação
    const revenueGrowth = lastMonthRevenueTotal > 0 
      ? ((currentMonthRevenueTotal - lastMonthRevenueTotal) / lastMonthRevenueTotal) * 100 
      : 0;
    
    const expenseGrowth = lastMonthExpensesTotal > 0 
      ? ((currentMonthExpensesTotal - lastMonthExpensesTotal) / lastMonthExpensesTotal) * 100 
      : 0;

    // Lucro líquido
    const currentMonthProfit = currentMonthReceivedTotal - currentMonthPaidExpensesTotal;
    const lastMonthProfit = lastMonthRevenues
      .filter(revenue => revenue.received)
      .reduce((sum, revenue) => sum + revenue.price, 0) - 
      (lastMonthCompanyExpenses.filter(expense => expense.paid).reduce((sum, expense) => sum + expense.price, 0) +
       lastMonthPersonalExpenses.filter(expense => expense.paid).reduce((sum, expense) => sum + expense.price, 0));

    const profitGrowth = lastMonthProfit > 0 
      ? ((currentMonthProfit - lastMonthProfit) / lastMonthProfit) * 100 
      : 0;

    // Taxa de recebimento
    const receivedRate = currentMonthRevenueTotal > 0 
      ? (currentMonthReceivedTotal / currentMonthRevenueTotal) * 100 
      : 0;

    // Taxa de pagamento
    const paymentRate = currentMonthExpensesTotal > 0 
      ? (currentMonthPaidExpensesTotal / currentMonthExpensesTotal) * 100 
      : 0;

    // Análise de contratos mensais
    const monthlyContracts = companyRevenues.filter(revenue => revenue.contractType === 'mensal');
    const monthlyRecurringRevenue = monthlyContracts.reduce((sum, revenue) => sum + revenue.price, 0);

    return {
      currentMonth: {
        revenue: currentMonthRevenueTotal,
        receivedRevenue: currentMonthReceivedTotal,
        expenses: currentMonthExpensesTotal,
        paidExpenses: currentMonthPaidExpensesTotal,
        profit: currentMonthProfit
      },
      growth: {
        revenue: revenueGrowth,
        expenses: expenseGrowth,
        profit: profitGrowth
      },
      rates: {
        received: receivedRate,
        payment: paymentRate
      },
      recurring: {
        monthlyRevenue: monthlyRecurringRevenue,
        contractsCount: monthlyContracts.length
      }
    };
  }, [companyRevenues, companyExpenses, personalExpenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500';
    if (growth < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4" />;
    if (growth < 0) return <TrendingDown className="h-4 w-4" />;
    return <BarChart3 className="h-4 w-4" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Receita do Mês */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="neon-border bg-gradient-to-br from-neon-blue/10 to-blue-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-neon-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-blue">
              {formatCurrency(metrics.currentMonth.revenue)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center gap-1 ${getGrowthColor(metrics.growth.revenue)}`}>
                {getGrowthIcon(metrics.growth.revenue)}
                <span className="text-xs font-medium">
                  {formatPercentage(metrics.growth.revenue)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Recebido</span>
                <span>{formatCurrency(metrics.currentMonth.receivedRevenue)}</span>
              </div>
              <Progress 
                value={metrics.rates.received} 
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Despesas do Mês */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="neon-border bg-gradient-to-br from-red-500/10 to-red-600/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(metrics.currentMonth.expenses)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center gap-1 ${getGrowthColor(metrics.growth.expenses)}`}>
                {getGrowthIcon(metrics.growth.expenses)}
                <span className="text-xs font-medium">
                  {formatPercentage(metrics.growth.expenses)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Pago</span>
                <span>{formatCurrency(metrics.currentMonth.paidExpenses)}</span>
              </div>
              <Progress 
                value={metrics.rates.payment} 
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lucro Líquido */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="neon-border bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <PiggyBank className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.currentMonth.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(metrics.currentMonth.profit)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center gap-1 ${getGrowthColor(metrics.growth.profit)}`}>
                {getGrowthIcon(metrics.growth.profit)}
                <span className="text-xs font-medium">
                  {formatPercentage(metrics.growth.profit)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
            <div className="mt-3">
              <Badge 
                variant={metrics.currentMonth.profit >= 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {metrics.currentMonth.profit >= 0 ? 'Positivo' : 'Negativo'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Receita Recorrente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card className="neon-border bg-gradient-to-br from-neon-purple/10 to-purple-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Recorrente</CardTitle>
            <Target className="h-4 w-4 text-neon-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-purple">
              {formatCurrency(metrics.recurring.monthlyRevenue)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {metrics.recurring.contractsCount} contratos mensais
              </span>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <Percent className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {metrics.currentMonth.revenue > 0 
                    ? ((metrics.recurring.monthlyRevenue / metrics.currentMonth.revenue) * 100).toFixed(1)
                    : 0
                  }% da receita total
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
