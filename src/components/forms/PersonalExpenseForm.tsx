
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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

  const form = useForm({
    resolver: zodResolver(personalExpenseSchema),
    defaultValues: {
      name: expense?.name || '',
      price: expense?.price || 0,
      observation: expense?.observation || '',
      paymentDate: expense?.paymentDate || new Date()
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const expenseData = {
        name: data.name,
        price: Number(data.price),
        paymentDate: data.paymentDate,
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
      console.error('Form submission error:', error);
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Conta *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-background/50 border-muted focus:border-neon-blue"
                          placeholder="Ex: Conta de luz, internet..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço (R$) *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.01"
                          min="0"
                          className="bg-background/50 border-muted focus:border-neon-blue"
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDate"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Data de Pagamento</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal bg-background/50 border-muted hover:border-neon-blue",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP", { locale: ptBR }) : "Selecione uma data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-background border-muted" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observation"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Observação</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="bg-background/50 border-muted focus:border-neon-blue resize-none"
                          placeholder="Observações adicionais (opcional)"
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {expense ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

PersonalExpenseForm.displayName = 'PersonalExpenseForm';
