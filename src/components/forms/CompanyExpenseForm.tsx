
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFinanceData } from '@/hooks/useFinanceData';
import { CompanyExpense, PaymentMethod, ExpenseType } from '@/types';
import { companyExpenseSchema } from '@/lib/validations';
import { FormWrapper } from './FormWrapper';
import { toast } from '@/hooks/use-toast';

interface CompanyExpenseFormProps {
  expense?: CompanyExpense;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanyExpenseForm = ({ expense, onSave, onCancel }: CompanyExpenseFormProps) => {
  const { saveCompanyExpense, updateCompanyExpense, isLoading } = useFinanceData();

  const form = useForm({
    resolver: zodResolver(companyExpenseSchema),
    defaultValues: {
      name: expense?.name || '',
      price: expense?.price?.toString() || '0',
      paymentMethod: expense?.paymentMethod || 'Pix' as PaymentMethod,
      type: expense?.type || 'Único' as ExpenseType,
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
        await updateCompanyExpense(expense.id, processedData);
        toast({ title: "Sucesso", description: "Despesa atualizada com sucesso!" });
      } else {
        await saveCompanyExpense(processedData);
        toast({ title: "Sucesso", description: "Despesa cadastrada com sucesso!" });
      }
      
      onSave();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({ 
        title: "Erro", 
        description: "Erro ao salvar despesa", 
        variant: "destructive" 
      });
    }
  };

  return (
    <FormWrapper
      title={expense ? 'Editar Despesa Empresarial' : 'Nova Despesa Empresarial'}
      icon={<Building2 className="h-5 w-5 text-red-400" />}
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
                  <FormLabel>Nome da Despesa *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-background/50 border-muted focus:border-neon-blue"
                      placeholder="Ex: Software, hospedagem..."
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
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pagamento</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <SelectTrigger className="bg-background/50 border-muted">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-muted">
                        <SelectItem value="Pix">Pix</SelectItem>
                        <SelectItem value="Cartão">Cartão</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <SelectTrigger className="bg-background/50 border-muted">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-muted">
                        <SelectItem value="Assinatura">Assinatura</SelectItem>
                        <SelectItem value="Único">Único</SelectItem>
                      </SelectContent>
                    </Select>
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
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
              disabled={isLoading}
            >
              {expense ? 'Atualizar' : 'Salvar'} Despesa
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
