
import { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, TrendingUp, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CompanyRevenue, PaymentMethod, ContractType, AccountType } from '@/types';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useFinanceData } from '@/hooks/useFinanceData';
import { companyRevenueSchema } from '@/lib/validations';
import { toast } from '@/hooks/use-toast';

interface Props {
  revenue?: CompanyRevenue;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanyRevenueForm = memo(({ revenue, onSave, onCancel }: Props) => {
  const [formData, setFormData] = useState({
    clientName: revenue?.clientName || '',
    service: revenue?.service || '',
    price: revenue?.price || 0,
    paymentMethod: revenue?.paymentMethod || 'Pix' as PaymentMethod,
    contractType: revenue?.contractType || 'único' as ContractType,
    contractMonths: revenue?.contractMonths || 1,
    paymentDate: revenue?.paymentDate || new Date(),
    accountType: revenue?.accountType || 'Marlon Lopo' as AccountType,
    received: revenue?.received || false,
    receivedDate: revenue?.receivedDate
  });

  const { saveRevenue, updateRevenue, isLoading } = useFinanceData();

  const handleSuccess = useCallback(async (validatedData: typeof formData) => {
    try {
      if (revenue) {
        await updateRevenue(revenue.id, validatedData);
        toast({ title: "Sucesso", description: "Receita atualizada com sucesso!" });
      } else {
        await saveRevenue(validatedData);
        toast({ title: "Sucesso", description: "Receita cadastrada com sucesso!" });
      }
      onSave();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao salvar receita", variant: "destructive" });
    }
  }, [revenue, saveRevenue, updateRevenue, onSave]);

  const { validate, getFieldError, isValidating } = useFormValidation({
    schema: companyRevenueSchema,
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
          <CardTitle className="flex items-center gap-2 text-neon-blue">
            <TrendingUp className="h-5 w-5" />
            {revenue ? 'Editar Receita' : 'Nova Receita Empresarial'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome do Cliente/Empresa *</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => updateField('clientName', e.target.value)}
                  className={cn(
                    "bg-background/50 border-muted focus:border-neon-blue",
                    getFieldError('clientName') && "border-red-500"
                  )}
                  placeholder="Digite o nome do cliente"
                  disabled={isProcessing}
                />
                {getFieldError('clientName') && (
                  <p className="text-sm text-red-500">{getFieldError('clientName')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Serviço Contratado *</Label>
                <Input
                  id="service"
                  value={formData.service}
                  onChange={(e) => updateField('service', e.target.value)}
                  className={cn(
                    "bg-background/50 border-muted focus:border-neon-blue",
                    getFieldError('service') && "border-red-500"
                  )}
                  placeholder="Descreva o serviço"
                  disabled={isProcessing}
                />
                {getFieldError('service') && (
                  <p className="text-sm text-red-500">{getFieldError('service')}</p>
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
                <Label>Tipo de Conta *</Label>
                <Select 
                  value={formData.accountType} 
                  onValueChange={(value: AccountType) => updateField('accountType', value)}
                  disabled={isProcessing}
                >
                  <SelectTrigger className="bg-background/50 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-muted">
                    <SelectItem value="Marlon Lopo">Marlon Lopo</SelectItem>
                    <SelectItem value="Infinity B2B">Infinity B2B</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label>Tipo de Contrato</Label>
                <Select 
                  value={formData.contractType} 
                  onValueChange={(value: ContractType) => updateField('contractType', value)}
                  disabled={isProcessing}
                >
                  <SelectTrigger className="bg-background/50 border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-muted">
                    <SelectItem value="único">Único</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.contractType === 'mensal' && (
                <div className="space-y-2">
                  <Label htmlFor="contractMonths">Número de Meses</Label>
                  <Input
                    id="contractMonths"
                    type="number"
                    min="1"
                    max="120"
                    value={formData.contractMonths}
                    onChange={(e) => updateField('contractMonths', parseInt(e.target.value) || 1)}
                    className={cn(
                      "bg-background/50 border-muted focus:border-neon-blue",
                      getFieldError('contractMonths') && "border-red-500"
                    )}
                    disabled={isProcessing}
                  />
                  {getFieldError('contractMonths') && (
                    <p className="text-sm text-red-500">{getFieldError('contractMonths')}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
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

              {/* Confirmação de Recebimento */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="received"
                    checked={formData.received}
                    onCheckedChange={(checked) => {
                      updateField('received', checked);
                      if (checked && !formData.receivedDate) {
                        updateField('receivedDate', new Date());
                      } else if (!checked) {
                        updateField('receivedDate', undefined);
                      }
                    }}
                    disabled={isProcessing}
                  />
                  <Label htmlFor="received" className="text-sm font-medium">
                    Pagamento recebido
                  </Label>
                </div>

                {formData.received && (
                  <div className="ml-6 space-y-2">
                    <Label>Data de Recebimento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-background/50 border-muted hover:border-neon-blue"
                          disabled={isProcessing}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.receivedDate ? format(formData.receivedDate, "PPP", { locale: ptBR }) : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background border-muted" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.receivedDate}
                          onSelect={(date) => date && updateField('receivedDate', date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white"
                disabled={isProcessing}
              >
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {revenue ? 'Atualizar' : 'Salvar'} Receita
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

CompanyRevenueForm.displayName = 'CompanyRevenueForm';
