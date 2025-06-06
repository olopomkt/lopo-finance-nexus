
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const FinancialDashboard = () => {
  const { companyRevenues, companyExpenses, personalExpenses } = useFinanceData();

  const dashboardData = useMemo(() => {
    // Cálculos básicos
    const totalRevenue = companyRevenues.reduce((sum, item) => sum + item.price, 0);
    const totalCompanyExpenses = companyExpenses.reduce((sum, item) => sum + item.price, 0);
    const totalPersonalExpenses = personalExpenses.reduce((sum, item) => sum + item.price, 0);
    const netProfit = totalRevenue - totalCompanyExpenses - totalPersonalExpenses;

    // Receitas confirmadas vs pendentes
    const receivedRevenue = companyRevenues.filter(r => r.received).reduce((sum, item) => sum + item.price, 0);
    const pendingRevenue = totalRevenue - receivedRevenue;

    // Despesas pagas vs pendentes
    const paidCompanyExpenses = companyExpenses.filter(e => e.paid).reduce((sum, item) => sum + item.price, 0);
    const pendingCompanyExpenses = totalCompanyExpenses - paidCompanyExpenses;
    const paidPersonalExpenses = personalExpenses.filter(e => e.paid).reduce((sum, item) => sum + item.price, 0);
    const pendingPersonalExpenses = totalPersonalExpenses - paidPersonalExpenses;

    // Dados por tipo de conta
    const marlonLopoRevenue = companyRevenues.filter(r => r.accountType === 'Marlon Lopo').reduce((sum, item) => sum + item.price, 0);
    const infinityB2BRevenue = companyRevenues.filter(r => r.accountType === 'Infinity B2B').reduce((sum, item) => sum + item.price, 0);

    // Dados para gráfico de pizza - Distribuição de gastos
    const expenseDistribution = [
      { name: 'Despesas Empresariais', value: totalCompanyExpenses, color: '#FF6B6B' },
      { name: 'Contas Pessoais', value: totalPersonalExpenses, color: '#4ECDC4' }
    ];

    // Dados para gráfico de barras - Por método de pagamento
    const paymentMethods = ['Pix', 'Cartão', 'Outro'];
    const paymentMethodData = paymentMethods.map(method => ({
      name: method,
      receitas: companyRevenues.filter(r => r.paymentMethod === method).reduce((sum, item) => sum + item.price, 0),
      despesas: companyExpenses.filter(e => e.paymentMethod === method).reduce((sum, item) => sum + item.price, 0)
    }));

    // Dados mensais para gráfico de linha
    const monthlyData = useMemo(() => {
      const months = {};
      const currentYear = new Date().getFullYear();
      
      // Inicializar meses
      for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, i, 1);
        const monthKey = format(date, 'MMM', { locale: ptBR });
        months[monthKey] = { month: monthKey, receitas: 0, despesas: 0 };
      }

      // Adicionar receitas
      companyRevenues.forEach(revenue => {
        const monthKey = format(revenue.paymentDate, 'MMM', { locale: ptBR });
        if (months[monthKey]) {
          months[monthKey].receitas += revenue.price;
        }
      });

      // Adicionar despesas
      [...companyExpenses, ...personalExpenses].forEach(expense => {
        const monthKey = format(expense.paymentDate, 'MMM', { locale: ptBR });
        if (months[monthKey]) {
          months[monthKey].despesas += expense.price;
        }
      });

      return Object.values(months);
    }, [companyRevenues, companyExpenses, personalExpenses]);

    return {
      totalRevenue,
      totalCompanyExpenses,
      totalPersonalExpenses,
      netProfit,
      receivedRevenue,
      pendingRevenue,
      paidCompanyExpenses,
      pendingCompanyExpenses,
      paidPersonalExpenses,
      pendingPersonalExpenses,
      marlonLopoRevenue,
      infinityB2BRevenue,
      expenseDistribution,
      paymentMethodData,
      monthlyData
    };
  }, [companyRevenues, companyExpenses, personalExpenses]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="neon-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-neon-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-blue">{formatCurrency(dashboardData.totalRevenue)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">Confirmado: {formatCurrency(dashboardData.receivedRevenue)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="neon-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(dashboardData.totalCompanyExpenses + dashboardData.totalPersonalExpenses)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500">
                Pago: {formatCurrency(dashboardData.paidCompanyExpenses + dashboardData.paidPersonalExpenses)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="neon-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-neon-purple" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dashboardData.netProfit >= 0 ? 'text-green-500' : 'text-red-400'}`}>
              {formatCurrency(dashboardData.netProfit)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Receitas - Despesas
            </div>
          </CardContent>
        </Card>

        <Card className="neon-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendências</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {formatCurrency(dashboardData.pendingRevenue + dashboardData.pendingCompanyExpenses + dashboardData.pendingPersonalExpenses)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              A receber/pagar
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="neon-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-neon-blue">Receitas por Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Marlon Lopo</span>
                <span className="font-bold text-neon-blue">{formatCurrency(dashboardData.marlonLopoRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Infinity B2B</span>
                <span className="font-bold text-neon-purple">{formatCurrency(dashboardData.infinityB2BRevenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neon-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-red-400">Status de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Confirmados
                </span>
                <span className="font-bold text-green-500">
                  {formatCurrency(dashboardData.receivedRevenue + dashboardData.paidCompanyExpenses + dashboardData.paidPersonalExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  Pendentes
                </span>
                <span className="font-bold text-yellow-500">
                  {formatCurrency(dashboardData.pendingRevenue + dashboardData.pendingCompanyExpenses + dashboardData.pendingPersonalExpenses)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza - Distribuição de Despesas */}
        <Card className="neon-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Distribuição de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.expenseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.expenseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Por Método de Pagamento */}
        <Card className="neon-border bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Receitas vs Despesas por Método</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="receitas" fill="#0088FE" name="Receitas" />
                <Bar dataKey="despesas" fill="#FF8042" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Linha - Evolução Mensal */}
      <Card className="neon-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Evolução Mensal - {new Date().getFullYear()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dashboardData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Line type="monotone" dataKey="receitas" stroke="#0088FE" strokeWidth={2} name="Receitas" />
              <Line type="monotone" dataKey="despesas" stroke="#FF8042" strokeWidth={2} name="Despesas" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
