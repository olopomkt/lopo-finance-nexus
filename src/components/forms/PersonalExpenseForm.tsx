
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFinanceData } from '@/hooks/useFinanceData';
import { PersonalExpense } from '@/types';
import { personalExpenseSchema } from '@/lib/validations';
import { toast } from '@/hooks/use-toast';

interface PersonalExpenseFormProps {
  expense?: PersonalExpense;
  onSave: () => void;
  onCancel: () => void;
}

export const PersonalExpenseForm = ({ expense, onSave, onCancel }: PersonalExpenseFormProps) => {
  const { savePersonalExpense, updatePersonalExpense } = useFinanceData();
  const [paymentDate, setPaymentDate] = useState<Date>(expense?.paymentDate || new Date());

  const form = useForm({
    resolver: zodResolver(personalExpenseSchema),
    defaultValues: {
      name: expense?.name || '',
      price: expense?.price || 0,
      observation: expense?.observation || ''
    }
  });

  const { formState: { errors, isSubmitting } } = form;

  const onSubmit = async (data: any) => {
    try {
      const expenseData = {
        name: data.name,
        price: Number(data.price),
        paymentDate,
        observation: data.observation || '',
        paid: expense?.paid || false,
        paidDate: expense?.paidDate
      };

      if (expense) {
        await updatePersonalExpense(expense.id, expenseData);
        toast({ title: "Sucesso", description: "Conta pessoal atualizada com sucesso!" });
      } else {
        await savePersonalExpense(expenseData);
        toast({ title: "Sucesso", description: "Conta pessoal cadastrada com sucesso!" });
      }
      
      onSave();
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Erro ao salvar conta pessoal", 
        variant: "destructive" 
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {expense ? 'Editar Conta Pessoal' : 'Nova Conta Pessoal'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  className={cn(
                    "bg-background/50 border-muted focus:border-neon-blue",
                    errors.name && "border-red-500"
                  )}
                  placeholder="Ex: Conta de luz, internet..."
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('price')}
                  className={cn(
                    "bg-background/50 border-muted focus:border-neon-blue",
                    errors.price && "border-red-500"
                  )}
                  placeholder="0.00"
                  disabled={isSubmitting}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
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
                        !paymentDate && "text-muted-foreground"
                      )}
                      disabled={isSubmitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-background border-muted" align="start">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={(date) => date && setPaymentDate(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observation">Observação</Label>
                <Textarea
                  id="observation"
                  {...form.register('observation')}
                  className={cn(
                    "bg-background/50 border-muted focus:border-neon-blue resize-none",
                    errors.observation && "border-red-500"
                  )}
                  placeholder="Observações adicionais (opcional)"
                  rows={3}
                  disabled={isSubmitting}
                />
                {errors.observation && (
                  <p className="text-sm text-red-500">{errors.observation.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {expense ? 'Atualizar' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

PersonalExpenseForm.displayName = 'PersonalExpenseForm';
