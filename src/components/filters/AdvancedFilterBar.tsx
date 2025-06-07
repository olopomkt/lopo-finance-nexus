
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Filter, X, Search, DollarSign, Calendar as CalendarIconTwo } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PaymentMethod, ContractType, ExpenseType, AccountType } from '@/types/finance';

export interface FilterState {
  searchTerm: string;
  paymentMethod: PaymentMethod | 'all';
  contractType: ContractType | 'all';
  expenseType: ExpenseType | 'all';
  accountType: AccountType | 'all';
  status: 'all' | 'received' | 'pending' | 'paid' | 'unpaid';
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  priceRange: {
    min: number | null;
    max: number | null;
  };
}

interface AdvancedFilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

const defaultFilters: FilterState = {
  searchTerm: '',
  paymentMethod: 'all',
  contractType: 'all',
  expenseType: 'all',
  accountType: 'all',
  status: 'all',
  dateRange: { start: null, end: null },
  priceRange: { min: null, max: null }
};

export const AdvancedFilterBar = ({ filters, onFiltersChange, className }: AdvancedFilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.searchTerm !== '' ||
      filters.paymentMethod !== 'all' ||
      filters.contractType !== 'all' ||
      filters.expenseType !== 'all' ||
      filters.accountType !== 'all' ||
      filters.status !== 'all' ||
      filters.dateRange.start !== null ||
      filters.dateRange.end !== null ||
      filters.priceRange.min !== null ||
      filters.priceRange.max !== null
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.paymentMethod !== 'all') count++;
    if (filters.contractType !== 'all') count++;
    if (filters.expenseType !== 'all') count++;
    if (filters.accountType !== 'all') count++;
    if (filters.status !== 'all') count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.priceRange.min !== null || filters.priceRange.max !== null) count++;
    return count;
  };

  return (
    <Card className={cn("neon-border bg-card/30 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? 'Menos' : 'Mais'} Filtros
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filtros Básicos - Sempre Visíveis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por nome, cliente, serviço..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="pl-10 bg-background/50 border-muted"
            />
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) => updateFilter('status', value as FilterState['status'])}
          >
            <SelectTrigger className="bg-background/50 border-muted">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="received">Recebido</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="unpaid">Não Pago</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.paymentMethod}
            onValueChange={(value) => updateFilter('paymentMethod', value as PaymentMethod | 'all')}
          >
            <SelectTrigger className="bg-background/50 border-muted">
              <SelectValue placeholder="Método de Pagamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Métodos</SelectItem>
              <SelectItem value="Pix">Pix</SelectItem>
              <SelectItem value="Cartão">Cartão</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtros Avançados - Expandíveis */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  value={filters.contractType}
                  onValueChange={(value) => updateFilter('contractType', value as ContractType | 'all')}
                >
                  <SelectTrigger className="bg-background/50 border-muted">
                    <SelectValue placeholder="Tipo de Contrato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="único">Único</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.expenseType}
                  onValueChange={(value) => updateFilter('expenseType', value as ExpenseType | 'all')}
                >
                  <SelectTrigger className="bg-background/50 border-muted">
                    <SelectValue placeholder="Tipo de Despesa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="Assinatura">Assinatura</SelectItem>
                    <SelectItem value="Único">Único</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.accountType}
                  onValueChange={(value) => updateFilter('accountType', value as AccountType | 'all')}
                >
                  <SelectTrigger className="bg-background/50 border-muted">
                    <SelectValue placeholder="Tipo de Conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Contas</SelectItem>
                    <SelectItem value="Marlon Lopo">Marlon Lopo</SelectItem>
                    <SelectItem value="Infinity B2B">Infinity B2B</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal bg-background/50 border-muted"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.start ? format(filters.dateRange.start, "dd/MM") : "Data Início"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border-muted" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.start || undefined}
                        onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, start: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal bg-background/50 border-muted"
                      >
                        <CalendarIconTwo className="mr-2 h-4 w-4" />
                        {filters.dateRange.end ? format(filters.dateRange.end, "dd/MM") : "Data Fim"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border-muted" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.end || undefined}
                        onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, end: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2 items-center">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Preço mínimo"
                    value={filters.priceRange.min || ''}
                    onChange={(e) => updateFilter('priceRange', { 
                      ...filters.priceRange, 
                      min: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    className="bg-background/50 border-muted"
                  />
                  <span className="text-muted-foreground">até</span>
                  <Input
                    type="number"
                    placeholder="Preço máximo"
                    value={filters.priceRange.max || ''}
                    onChange={(e) => updateFilter('priceRange', { 
                      ...filters.priceRange, 
                      max: e.target.value ? parseFloat(e.target.value) : null 
                    })}
                    className="bg-background/50 border-muted"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
