
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompanyRevenue, PaymentMethod, ContractType, AccountType } from '@/types/finance';
import { useFinanceData } from '@/hooks/useFinanceData';
import { companyRevenueSchema } from '@/lib/validations';
import { dateTransformers } from '@/lib/dateUtils';
import { FormWrapper } from './FormWrapper';
import { toast } from '@/hooks/use-toast';

interface Props {
  revenue?: CompanyRevenue;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanyRevenueForm = ({ revenue, onSave, onCancel }: Props) => {
  const { saveRevenue, updateRevenue, isLoading } = useFinanceData();

  const form = useForm({
    resolver: zodResolver(companyRevenueSchema),
    defaultValues: {
      clientName: revenue?.clientName || '',
      service: revenue?.service || '',
      price: revenue?.price?.toString() || '0',
      paymentMethod: revenue?.paymentMethod || 'Pix' as PaymentMethod,
      contractType: revenue?.contractType || 'único' as ContractType,
      contractMonths: revenue?.contractMonths || 1,
      paymentDate: revenue?.paymentDate || new Date(),
      accountType: revenue?.accountType || 'Marlon Lopo' as AccountType,
      received: revenue?.received || false,
      receivedDate: revenue?.receivedDate || undefined
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const processedData = {
        ...data,
        price: parseFloat(data.price) || 0,
        accountType: data.accountType || 'Marlon Lopo'
      };

      if (revenue) {
        await updateRevenue(revenue.id, processedData);
        toast({ title: "Sucesso", description: "Receita atualizada com sucesso!" });
      } else {
        await saveRevenue(processedData);
        toast({ title: "Sucesso", description: "Receita cadastrada com sucesso!" });
      }
      onSave();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({ 
        title: "Erro", 
        description: "Erro ao salvar receita", 
        variant: "destructive" 
      });
    }
  };

  const watchContractType = form.watch('contractType');
  const watchReceived = form.watch('received');

  return (
    <FormWrapper
      title={revenue ? 'Editar Receita' : 'Nova Receita Empresarial'}
      icon={<TrendingUp className="h-5 w-5 text-neon-blue" />}
      onCancel={onCancel}
      isSubmitting={isLoading}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente/Empresa *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-background/50 border-muted focus:border-neon-blue"
                      placeholder="Digite o nome do cliente"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço Contratado *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-background/50 border-muted focus:border-neon-blue"
                      placeholder="Descreva o serviço"
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
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Conta *</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-background/50 border-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-muted">
                        <SelectItem value="Marlon Lopo">Marlon Lopo</SelectItem>
                        <SelectItem value="Infinity B2B">Infinity B2B</SelectItem>
                      </SelectContent>
                    </Select>
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
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Contrato</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="bg-background/50 border-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-muted">
                        <SelectItem value="único">Único</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchContractType === 'mensal' && (
              <FormField
                control={form.control}
                name="contractMonths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Meses</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min="1"
                        max="120"
                        className="bg-background/50 border-muted focus:border-neon-blue"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
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
                          {field.value ? dateTransformers.formatCalendar(field.value) : "Selecione uma data"}
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

            <div className="md:col-span-2 space-y-4">
              <FormField
                control={form.control}
                name="received"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked && !form.getValues('receivedDate')) {
                            form.setValue('receivedDate', new Date());
                          } else if (!checked) {
                            form.setValue('receivedDate', undefined);
                          }
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-medium">
                      Pagamento recebido
                    </FormLabel>
                  </FormItem>
                )}
              />

              {watchReceived && (
                <FormField
                  control={form.control}
                  name="receivedDate"
                  render={({ field }) => (
                    <FormItem className="ml-6">
                      <FormLabel>Data de Recebimento</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal bg-background/50 border-muted hover:border-neon-blue"
                              disabled={isLoading}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? dateTransformers.formatCalendar(field.value) : "Selecione uma data"}
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
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white"
              disabled={isLoading}
            >
              {revenue ? 'Atualizar' : 'Salvar'} Receita
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
