
import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CompanyExpense, PaymentMethod, ExpenseType } from '@/types';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useFinanceData } from '@/hooks/useFinanceData';
import { companyExpenseSchema } from '@/lib/validations';
import { toast } from '@/hooks/use-toast';

interface Props {
  expense?: CompanyExpense;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanyExpenseForm = memo(({ expense, onSave, onCancel }: Props) => {
  const [formData, setFormData] = useState({
    name: expense?.name || '',
    price: expense?.price || 0,
    paymentMethod: expense?.paymentMethod || 'Pix' as PaymentMethod,
    type: expense?.type || 'Único' as ExpenseType,
    paymentDate: expense?.paymentDate || new Date()
  });

  const { saveCompanyExpense, updateCompanyExpense, isLoading } = useFinanceData();

  const handleSuccess = useCallback(async (validatedData: typeof formData) => {
    try {
      if (expense) {
        await updateCompanyExpense(expense.id, validatedData);
        toast({ title: "Sucesso", description: "Despesa atualizada com sucesso!" });
      } else {
        await saveCompanyExpense(validatedData);
        toast({ title: "Sucesso", description: "Despesa cadastrada com sucesso!" });
      }
      onSave();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao salvar despesa", variant: "destructive" });
    }
  }, [expense, saveCompanyExpense, updateCompanyExpense, onSave]);

  const { validate, getFieldError, isValidating } = useFormValidation({
    schema: companyExpenseSchema,
    onSuccess: handleSuccess
  });

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    validate(formData);
  }, [formData, validate]);

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const isProcessing = isLoading || isValidating;

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
                  onChange={(e) => updateField('name', e.target.value)}
                  className={cn(
                    "bg-background/50 border-muted focus:border-neon-blue",
                    getFieldError('name') && "border-red-500"
                  )}
                  placeholder="Descreva o gasto"
                  disabled={isProcessing}
                />
                {getFieldError('name') && (
                  <p className="text-sm text-red-500">{getFieldError('name')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                  className={cn(
                    "bg-background/50 border-muted focus:border-neon-blue",
                    getFieldError('price') && "border-red-500"
                  )}
                  placeholder="0.00"
                  disabled={isProcessing}
                />
                {getFieldError('price') && (
                  <p className="text-sm text-red-500">{getFieldError('price')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Forma de Pagamento</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value: PaymentMethod) => updateField('paymentMethod', value)}
                  disabled={isProcessing}
                >
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
                <Select 
                  value={formData.type} 
                  onValueChange={(value: ExpenseType) => updateField('type', value)}
                  disabled={isProcessing}
                >
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
                        !formData.paymentDate && "text-muted-foreground",
                        getFieldError('paymentDate') && "border-red-500"
                      )}
                      disabled={isProcessing}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.paymentDate ? format(formData.paymentDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border-muted" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.paymentDate}
                      onSelect={(date) => date && updateField('paymentDate', date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {getFieldError('paymentDate') && (
                  <p className="text-sm text-red-500">{getFieldError('paymentDate')}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                disabled={isProcessing}
              >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {expense ? 'Atualizar' : 'Salvar'} Despesa
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-muted hover:border-red-500 hover:text-red-500"
                disabled={isProcessing}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
});

CompanyExpenseForm.displayName = 'CompanyExpenseForm';
