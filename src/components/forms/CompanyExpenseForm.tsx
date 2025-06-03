
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CompanyExpense, PaymentMethod, ExpenseType } from '@/types';
import { storageService } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

interface Props {
  expense?: CompanyExpense;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanyExpenseForm = ({ expense, onSave, onCancel }: Props) => {
  const [formData, setFormData] = useState({
    name: expense?.name || '',
    price: expense?.price || 0,
    paymentMethod: expense?.paymentMethod || 'Pix' as PaymentMethod,
    type: expense?.type || 'Único' as ExpenseType,
    paymentDate: expense?.paymentDate || new Date()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.price <= 0) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    try {
      if (expense) {
        storageService.updateCompanyExpense(expense.id, formData);
        toast({ title: "Sucesso", description: "Despesa atualizada com sucesso!" });
      } else {
        storageService.saveCompanyExpense(formData);
        toast({ title: "Sucesso", description: "Despesa cadastrada com sucesso!" });
      }
      onSave();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao salvar despesa", variant: "destructive" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card className="neon-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <TrendingDown className="h-5 w-5" />
            {expense ? 'Editar Despesa' : 'Nova Despesa Empresarial'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Gasto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-background/50 border-muted focus:border-neon-blue"
                  placeholder="Descreva o gasto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="bg-background/50 border-muted focus:border-neon-blue"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select value={formData.paymentMethod} onValueChange={(value: PaymentMethod) => setFormData({ ...formData, paymentMethod: value })}>
                  <SelectTrigger className="bg-background/50 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-muted">
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Cartão">Cartão</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(value: ExpenseType) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-background/50 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-muted">
                    <SelectItem value="Único">Único</SelectItem>
                    <SelectItem value="Assinatura">Assinatura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Data de Pagamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background/50 border-muted hover:border-neon-blue",
                        !formData.paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.paymentDate ? format(formData.paymentDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border-muted" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.paymentDate}
                      onSelect={(date) => date && setFormData({ ...formData, paymentDate: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              >
                {expense ? 'Atualizar' : 'Salvar'} Despesa
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-muted hover:border-red-500 hover:text-red-500"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
