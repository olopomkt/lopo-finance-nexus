
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, BarChart3, Calendar as CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CompanyRevenue, CompanyExpense, PersonalExpense } from '@/types';
import { toast } from '@/hooks/use-toast';

interface Props {
  revenues: CompanyRevenue[];
  companyExpenses: CompanyExpense[];
  personalExpenses: PersonalExpense[];
}

export const ReportsPanel = ({ revenues, companyExpenses, personalExpenses }: Props) => {
  const [reportType, setReportType] = useState<'monthly' | 'period'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getFilteredData = () => {
    let startDate: Date, endDate: Date;

    if (reportType === 'monthly') {
      startDate = startOfMonth(selectedMonth);
      endDate = endOfMonth(selectedMonth);
    } else {
      if (!dateFrom || !dateTo) return { revenues: [], companyExpenses: [], personalExpenses: [] };
      startDate = dateFrom;
      endDate = dateTo;
    }

    const filteredRevenues = revenues.filter(r => 
      r.paymentDate >= startDate && r.paymentDate <= endDate
    );
    const filteredCompanyExpenses = companyExpenses.filter(e => 
      e.paymentDate >= startDate && e.paymentDate <= endDate
    );
    const filteredPersonalExpenses = personalExpenses.filter(e => 
      e.paymentDate >= startDate && e.paymentDate <= endDate
    );

    return { revenues: filteredRevenues, companyExpenses: filteredCompanyExpenses, personalExpenses: filteredPersonalExpenses };
  };

  const calculateSummary = () => {
    const { revenues: filteredRevenues, companyExpenses: filteredCompanyExpenses, personalExpenses: filteredPersonalExpenses } = getFilteredData();
    
    const totalRevenue = filteredRevenues.reduce((sum, r) => sum + r.price, 0);
    const totalCompanyExpenses = filteredCompanyExpenses.reduce((sum, e) => sum + e.price, 0);
    const totalPersonalExpenses = filteredPersonalExpenses.reduce((sum, e) => sum + e.price, 0);
    const totalExpenses = totalCompanyExpenses + totalPersonalExpenses;
    const netProfit = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalCompanyExpenses,
      totalPersonalExpenses,
      totalExpenses,
      netProfit,
      revenueCount: filteredRevenues.length,
      companyExpenseCount: filteredCompanyExpenses.length,
      personalExpenseCount: filteredPersonalExpenses.length
    };
  };

  const exportToCSV = () => {
    const { revenues: filteredRevenues, companyExpenses: filteredCompanyExpenses, personalExpenses: filteredPersonalExpenses } = getFilteredData();
    
    let csvContent = 'Tipo,Data,Descrição,Valor,Forma de Pagamento,Observações\n';
    
    filteredRevenues.forEach(r => {
      csvContent += `Receita,${format(r.paymentDate, 'dd/MM/yyyy')},${r.clientName} - ${r.service},${r.price},${r.paymentMethod},Contrato ${r.contractType}\n`;
    });
    
    filteredCompanyExpenses.forEach(e => {
      csvContent += `Despesa Empresarial,${format(e.paymentDate, 'dd/MM/yyyy')},${e.name},${e.price},${e.paymentMethod},${e.type}\n`;
    });
    
    filteredPersonalExpenses.forEach(e => {
      csvContent += `Conta Pessoal,${format(e.paymentDate, 'dd/MM/yyyy')},${e.name},${e.price},,${e.observation || ''}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_lopo_finance_${format(new Date(), 'dd-MM-yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Relatório exportado!", description: "O arquivo CSV foi baixado com sucesso." });
  };

  const summary = calculateSummary();

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <Card className="neon-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-cyan">
            <BarChart3 className="h-5 w-5" />
            Configuração do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select value={reportType} onValueChange={(value: 'monthly' | 'period') => setReportType(value)}>
                <SelectTrigger className="glass-effect border-neon-cyan/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border-neon-cyan/20">
                  <SelectItem value="monthly">Mensal</SelectItem>
                  <SelectItem value="period">Período Customizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === 'monthly' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Mês</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal glass-effect border-neon-cyan/20"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(selectedMonth, 'MMMM yyyy', { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border-neon-cyan/20">
                    <Calendar
                      mode="single"
                      selected={selectedMonth}
                      onSelect={(date) => date && setSelectedMonth(date)}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Inicial</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal glass-effect border-neon-cyan/20"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFrom ? format(dateFrom, 'dd/MM/yyyy') : 'Selecionar'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border-neon-cyan/20">
                      <Calendar
                        mode="single"
                        selected={dateFrom || undefined}
                        onSelect={setDateFrom}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data Final</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal glass-effect border-neon-cyan/20"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateTo ? format(dateTo, 'dd/MM/yyyy') : 'Selecionar'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border-neon-cyan/20">
                      <Calendar
                        mode="single"
                        selected={dateTo || undefined}
                        onSelect={setDateTo}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-effect border-neon-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-neon-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-xl font-bold text-neon-blue">{formatCurrency(summary.totalRevenue)}</p>
                <p className="text-xs text-muted-foreground">{summary.revenueCount} registros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-red-400/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm text-muted-foreground">Despesas Empresa</p>
                <p className="text-xl font-bold text-red-400">{formatCurrency(summary.totalCompanyExpenses)}</p>
                <p className="text-xs text-muted-foreground">{summary.companyExpenseCount} registros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-neon-purple/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-neon-purple" />
              <div>
                <p className="text-sm text-muted-foreground">Contas Pessoais</p>
                <p className="text-xl font-bold text-neon-purple">{formatCurrency(summary.totalPersonalExpenses)}</p>
                <p className="text-xs text-muted-foreground">{summary.personalExpenseCount} registros</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`glass-effect ${summary.netProfit >= 0 ? 'border-green-400/20' : 'border-red-400/20'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className={`h-5 w-5 ${summary.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              <div>
                <p className="text-sm text-muted-foreground">Resultado</p>
                <p className={`text-xl font-bold ${summary.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(summary.netProfit)}
                </p>
                <Badge variant={summary.netProfit >= 0 ? 'default' : 'destructive'} className="text-xs">
                  {summary.netProfit >= 0 ? 'Lucro' : 'Prejuízo'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="neon-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-neon-cyan">
            <Download className="h-5 w-5" />
            Exportar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={exportToCSV}
              className="bg-gradient-to-r from-neon-cyan to-neon-blue hover:from-neon-cyan/80 hover:to-neon-blue/80"
            >
              <FileText className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
