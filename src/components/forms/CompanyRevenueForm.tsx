
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { CompanyRevenue, PaymentMethod, ContractType } from '@/types';
import { storageService } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

interface Props {
  revenue?: CompanyRevenue;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanyRevenueForm = ({ revenue, onSave, onCancel }: Props) => {
  const [formData, setFormData] = useState({
    clientName: revenue?.clientName || '',
    service: revenue?.service || '',
    price: revenue?.price || 0,
    paymentMethod: revenue?.paymentMethod || 'Pix' as PaymentMethod,
    contractType: revenue?.contractType || 'único' as ContractType,
    contractMonths: revenue?.contractMonths || 1,
    paymentDate: revenue?.paymentDate || new Date()
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.service || formData.price <= 0) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    try {
      if (revenue) {
        storageService.updateCompanyRevenue(revenue.id, formData);
        toast({ title: "Sucesso", description: "Receita atualizada com sucesso!" });
      } else {
        storageService.saveCompanyRevenue(formData);
        toast({ title: "Sucesso", description: "Receita cadastrada com sucesso!" });
      }
      onSave();
    } catch (error) {
      toast({ title: "Erro", description: "Erro ao salvar receita", variant: "destructive" });
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
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="bg-background/50 border-muted focus:border-neon-blue"
                  placeholder="Digite o nome do cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Serviço Contratado *</Label>
                <Input
                  id="service"
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="bg-background/50 border-muted focus:border-neon-blue"
                  placeholder="Descreva o serviço"
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
                <Label>Tipo de Contrato</Label>
                <Select value={formData.contractType} onValueChange={(value: ContractType) => setFormData({ ...formData, contractType: value })}>
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
                    value={formData.contractMonths}
                    onChange={(e) => setFormData({ ...formData, contractMonths: parseInt(e.target.value) || 1 })}
                    className="bg-background/50 border-muted focus:border-neon-blue"
                  />
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
                className="flex-1 bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white"
              >
                {revenue ? 'Atualizar' : 'Salvar'} Receita
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
