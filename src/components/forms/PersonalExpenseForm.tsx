
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFinanceData } from '@/hooks/useFinanceData';
import { PersonalExpense } from '@/types';
import { personalExpenseSchema } from '@/lib/validations';
import { FormWrapper } from './FormWrapper';
import { toast } from '@/hooks/use-toast';

interface PersonalExpenseFormProps {
  expense?: PersonalExpense;
  onSave: () => void;
  onCancel: () => void;
}

export const PersonalExpenseForm = ({ expense, onSave, onCancel }: PersonalExpenseFormProps) => {
  const { savePersonalExpense, updatePersonalExpense, isLoading } = useFinanceData();

  const form = useForm({
    resolver: zodResolver(personalExpenseSchema),
    defaultValues: {
      name: expense?.name || '',
      price: expense?.price?.toString() || '0',
      observation: expense?.observation || '',
      paymentDate: expense?.paymentDate || new Date()
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const processedData = {
        ...data,
        price: parseFloat(data.price) || 0
      };
      if (expense) {
        await updatePersonalExpense(expense.id, processedData);
        toast({ title: "Sucesso", description: "Conta pessoal atualizada com sucesso!" });
      } else {
        await savePersonalExpense(processedData);
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
    <FormWrapper
      title={expense ? 'Editar Conta Pessoal' : 'Nova Conta Pessoal'}
      icon={<User className="h-5 w-5 text-neon-purple" />}
      onCancel={onCancel}
      isSubmitting={isLoading}
    >
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
                      disabled={isLoading}
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
                      type="text"
                      inputMode="decimal"
                      className="bg-background/50 border-muted focus:border-neon-blue"
                      placeholder="0.00"
                      disabled={isLoading}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                        field.onChange(value);
                      }}
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
                          disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-neon-purple to-purple-600 hover:from-neon-purple/80 hover:to-purple-600/80 text-white"
              disabled={isLoading}
            >
              {expense ? 'Atualizar' : 'Salvar'} Conta
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-muted hover:border-red-500 hover:text-red-500"
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </FormWrapper>
  );
};
