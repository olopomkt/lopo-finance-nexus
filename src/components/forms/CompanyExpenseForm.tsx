import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useFinanceData } from '@/hooks/useFinanceData';
import { CompanyExpense, PaymentMethod, ExpenseType } from '@/types';
import { companyExpenseSchema } from '@/lib/validations';
import { toast } from '@/hooks/use-toast';

interface CompanyExpenseFormProps {
  expense?: CompanyExpense;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanyExpenseForm = ({ expense, onSave, onCancel }: CompanyExpenseFormProps) => {
  const { saveCompanyExpense, updateCompanyExpense } = useFinanceData();
  const [paymentDate, setPaymentDate] = useState<Date>(expense?.paymentDate || new Date());

  const form = useForm({
    resolver: zodResolver(companyExpenseSchema),
    defaultValues: {
      name: expense?.name || '',
      price: expense?.price || 0,
      paymentMethod: expense?.paymentMethod || 'Pix' as PaymentMethod,
      type: expense?.type || 'Único' as ExpenseType,
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const expenseData = {
        name: data.name,
        price: Number(data.price),
        paymentMethod: data.paymentMethod as PaymentMethod,
        type: data.type as ExpenseType,
        paymentDate,
        paid: expense?.paid || false,
        paidDate: expense?.paidDate
      };

      if (expense) {
        await updateCompanyExpense(expense.id, expenseData);
        toast({ title: "Sucesso", description: "Despesa atualizada com sucesso!" });
      } else {
        await saveCompanyExpense(expenseData);
        toast({ title: "Sucesso", description: "Despesa cadastrada com sucesso!" });
      }
      
      onSave();
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Erro ao salvar despesa", 
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
            {expense ? 'Editar Despesa Empresarial' : 'Nova Despesa Empresarial'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Nome da despesa" {...form.register('name')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço</Label>
                <Input id="price" type="number" placeholder="0.00" {...form.register('price')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                <Select onValueChange={form.setValue.bind(null, 'paymentMethod')} defaultValue={form.getValues('paymentMethod')}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pix">Pix</SelectItem>
                    <SelectItem value="Cartão">Cartão</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select onValueChange={form.setValue.bind(null, 'type')} defaultValue={form.getValues('type')}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assinatura">Assinatura</SelectItem>
                    <SelectItem value="Único">Único</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data de Pagamento</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={paymentDate}
                      onSelect={setPaymentDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
        </CardContent>
      </Card>
    </motion.div>
  );
};
