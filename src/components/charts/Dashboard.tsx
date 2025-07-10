
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { format, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const { companyRevenues, companyExpenses, personalExpenses } = useFinanceData();
  
  const revenues = companyRevenues;
  const companyExpensesList = companyExpenses;
  const personalExpensesList = personalExpenses;

  const availableYears = useMemo(() => {
    const allDates = [
      ...revenues.map(r => r.paymentDate),
      ...companyExpensesList.map(e => e.paymentDate),
      ...personalExpensesList.map(e => e.paymentDate)
    ];
    
    const years = [...new Set(allDates.map(date => getYear(date)))].sort((a, b) => b - a);
    return years.length > 0 ? years : [new Date().getFullYear()];
  }, [revenues, companyExpensesList, personalExpensesList]);

  const monthlyData = useMemo(() => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    return months.map((month, index) => {
      const monthRevenues = revenues
        .filter(r => getYear(r.paymentDate) === parseInt(selectedYear) && getMonth(r.paymentDate) === index)
        .reduce((sum, r) => sum + r.price, 0);

      const monthCompanyExpenses = companyExpensesList
        .filter(e => getYear(e.paymentDate) === parseInt(selectedYear) && getMonth(e.paymentDate) === index)
        .reduce((sum, e) => sum + e.price, 0);

      const monthPersonalExpenses = personalExpensesList
        .filter(e => getYear(e.paymentDate) === parseInt(selectedYear) && getMonth(e.paymentDate) === index)
        .reduce((sum, e) => sum + e.price, 0);

      const totalExpenses = monthCompanyExpenses + monthPersonalExpenses;

      return {
        month,
        receitas: monthRevenues,
        despesas: totalExpenses,
        lucro: monthRevenues - totalExpenses
      };
    });
  }, [revenues, companyExpensesList, personalExpensesList, selectedYear]);

  const totalRevenue = revenues
    .filter(r => getYear(r.paymentDate) === parseInt(selectedYear))
    .reduce((sum, r) => sum + r.price, 0);

  const totalExpenses = [
    ...companyExpensesList.filter(e => getYear(e.paymentDate) === parseInt(selectedYear)),
    ...personalExpensesList.filter(e => getYear(e.paymentDate) === parseInt(selectedYear))
  ].reduce((sum, e) => sum + e.price, 0);

  const profit = totalRevenue - totalExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const expensesByCategory = useMemo(() => {
    const companyTotal = companyExpensesList
      .filter(e => getYear(e.paymentDate) === parseInt(selectedYear))
      .reduce((sum, e) => sum + e.price, 0);
    
    const personalTotal = personalExpensesList
      .filter(e => getYear(e.paymentDate) === parseInt(selectedYear))
      .reduce((sum, e) => sum + e.price, 0);

    return [
      { name: 'Empresariais', value: companyTotal, color: '#ef4444' },
      { name: 'Pessoais', value: personalTotal, color: '#8b5cf6' }
    ].filter(item => item.value > 0);
  }, [companyExpensesList, personalExpensesList, selectedYear]);

  const COLORS = ['#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header with Year Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <motion.h2 
          className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Dashboard Financeiro
        </motion.h2>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 bg-background/50 border-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border-muted">
              {availableYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="neon-border bg-card/50 backdrop-blur-sm hover:neon-glow transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neon-blue">Total de Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-neon-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-neon-blue">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="neon-border bg-card/50 backdrop-blur-sm hover:neon-glow transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-400">Total de Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="neon-border bg-card/50 backdrop-blur-sm hover:neon-glow transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lucro/Prejuízo</CardTitle>
              <DollarSign className={`h-4 w-4 ${profit >= 0 ? 'text-neon-cyan' : 'text-red-400'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profit >= 0 ? 'text-neon-cyan' : 'text-red-400'}`}>
                {formatCurrency(profit)}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="neon-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-neon-blue">Faturamento Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Receitas']}
                    labelStyle={{ color: '#000' }}
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #00D4FF' }}
                  />
                  <Bar dataKey="receitas" fill="url(#revenueGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00D4FF" />
                      <stop offset="100%" stopColor="#0066CC" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Expenses Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="neon-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-400">Custos Mensais</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Despesas']}
                    labelStyle={{ color: '#000' }}
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #ef4444' }}
                  />
                  <Bar dataKey="despesas" fill="url(#expenseGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#991b1b" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Profit/Loss Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="neon-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-neon-cyan">Evolução do Lucro</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Lucro']}
                    labelStyle={{ color: '#000' }}
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #06FFA5' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="lucro" 
                    stroke="#06FFA5" 
                    strokeWidth={3}
                    dot={{ fill: '#06FFA5', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expense Distribution */}
        {expensesByCategory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="neon-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-neon-purple">Distribuição de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Valor']}
                      contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #8b5cf6' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
