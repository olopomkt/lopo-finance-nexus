
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Calendar as CalendarIcon, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FilterState } from '@/hooks/useUnifiedFilters';

interface Props {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onClearFilters: () => void;
  showPaymentMethodFilter?: boolean;
}

export const FilterBar = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  showPaymentMethodFilter = true 
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.searchTerm,
    filters.dateFrom,
    filters.dateTo,
    filters.paymentMethod
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, serviço ou observação..."
          value={filters.searchTerm}
          onChange={(e) => onFilterChange('searchTerm', e.target.value)}
          className="pl-10 glass-effect border-neon-blue/20 focus:border-neon-blue/50"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="glass-effect border-neon-cyan/20 hover:border-neon-cyan/50"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros Avançados
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 bg-neon-blue/20 text-neon-blue">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="text-red-400 hover:bg-red-500/10"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isOpen && (
        <div className="glass-effect p-4 rounded-lg border border-neon-cyan/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neon-cyan">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal glass-effect border-neon-cyan/20"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom ? format(filters.dateFrom, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border-neon-cyan/20">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom || undefined}
                    onSelect={(date) => onFilterChange('dateFrom', date)}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neon-cyan">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal glass-effect border-neon-cyan/20"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo ? format(filters.dateTo, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border-neon-cyan/20">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo || undefined}
                    onSelect={(date) => onFilterChange('dateTo', date)}
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Payment Method */}
            {showPaymentMethodFilter && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-neon-cyan">Forma de Pagamento</label>
                <Select
                  value={filters.paymentMethod || ''}
                  onValueChange={(value) => onFilterChange('paymentMethod', value || null)}
                >
                  <SelectTrigger className="glass-effect border-neon-cyan/20">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-neon-cyan/20">
                    <SelectItem value="">Todas</SelectItem>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Cartão">Cartão</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neon-cyan">Ordenar por</label>
              <div className="flex gap-2">
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: 'date' | 'price' | 'name') => onFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="glass-effect border-neon-cyan/20 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-neon-cyan/20">
                    <SelectItem value="date">Data</SelectItem>
                    <SelectItem value="price">Valor</SelectItem>
                    <SelectItem value="name">Nome</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="glass-effect border-neon-cyan/20"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
