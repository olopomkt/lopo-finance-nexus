
import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PersonalExpense } from '@/types';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useFinanceData } from '@/hooks/useFinanceData';
import { personalExpenseSchema } from '@/lib/validations';
import { toast } from '@/hooks/use-toast';

interface Props {
  expense?: PersonalExpense;
  onSave: () => void;
  onCancel: () => void;
}

export const PersonalExpenseForm = memo(({ expense, onSave, onCancel }: Props) => {
  const [formData, setFormData] = useState({
    name: expense?.name || '',
    price: expense?.price || 0,
    paymentDate: expense?.paymentDate || new Date(),
    observation: expense?.observation || ''
  });

  const { savePersonalExpense, updatePersonalExpense, isLoading } = useFinanceData();

  const handleSuccess = useCallback(async (validatedData: typeof formData) => {
    try {
      if (expense) {
        await updatePersonalExpense(expense.id, validatedData);
        toast({ title: "Sucesso", description: "Conta atualizada com sucesso!" });
      } else {
        await savePersonalExpense(validatedData);
        toast({ title: "Sucesso", description: "Conta cadastrada com sucesso!" });
      }
      onSave();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao salvar conta", variant: "destructive" });
    }
  }, [expense, savePersonalExpense, updatePersonalExpense, onSave]);

  const { validate, getFieldError, isValidating } = useFormValidation({
    schema: personalExpenseSchema,
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
          <CardTitle className="flex items-center gap-2 text-neon-purple">
            <User className="h-5 w-5" />
            {expense ? 'Editar Conta' : 'Nova Conta Pessoal'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={cn(
                    "bg-background/50 border-muted focus:border-neon-blue",
                    getFieldError('name') && "border-red-500"
                  )}
                  placeholder="Ex: Conta de luz, internet..."
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observation">Observação</Label>
                <Textarea
                  id="observation"
                  value={formData.observation}
                  onChange={(e) => updateField('observation', e.target.value)}
                  className={cn(
                    "bg-background/50 border-muted focus:border-neon-blue resize-none",
                    getFieldError('observation') && "border-red-500"
                  )}
                  placeholder="Observações adicionais (opcional)"
                  rows={3}
                  disabled={isProcessing}
                />
                {getFieldError('observation') && (
                  <p className="text-sm text-red-500">{getFieldError('observation')}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-purple/80 hover:to-neon-pink/80 text-white"
                disabled={isProcessing}
              >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {expense ? 'Atualizar' : 'Salvar'} Conta
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

PersonalExpenseForm.displayName = 'PersonalExpenseForm';
