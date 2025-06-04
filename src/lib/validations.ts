
import { z } from 'zod';

// Schema para receita empresarial
export const companyRevenueSchema = z.object({
  clientName: z.string()
    .min(2, 'Nome do cliente deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do cliente deve ter no máximo 100 caracteres')
    .trim(),
  service: z.string()
    .min(2, 'Serviço deve ter pelo menos 2 caracteres')
    .max(200, 'Serviço deve ter no máximo 200 caracteres')
    .trim(),
  price: z.number()
    .positive('Preço deve ser positivo')
    .max(999999999.99, 'Preço muito alto')
    .refine((val) => Number(val.toFixed(2)) === val, 'Preço deve ter no máximo 2 casas decimais'),
  paymentMethod: z.enum(['Pix', 'Cartão', 'Outro'], {
    errorMap: () => ({ message: 'Forma de pagamento inválida' })
  }),
  contractType: z.enum(['único', 'mensal'], {
    errorMap: () => ({ message: 'Tipo de contrato inválido' })
  }),
  contractMonths: z.number()
    .int('Número de meses deve ser um número inteiro')
    .min(1, 'Deve ter pelo menos 1 mês')
    .max(120, 'Máximo de 120 meses')
    .optional(),
  paymentDate: z.date({
    errorMap: () => ({ message: 'Data de pagamento é obrigatória' })
  })
});

// Schema para despesa empresarial
export const companyExpenseSchema = z.object({
  name: z.string()
    .min(2, 'Nome do gasto deve ter pelo menos 2 caracteres')
    .max(100, 'Nome do gasto deve ter no máximo 100 caracteres')
    .trim(),
  price: z.number()
    .positive('Preço deve ser positivo')
    .max(999999999.99, 'Preço muito alto')
    .refine((val) => Number(val.toFixed(2)) === val, 'Preço deve ter no máximo 2 casas decimais'),
  paymentMethod: z.enum(['Pix', 'Cartão', 'Outro'], {
    errorMap: () => ({ message: 'Forma de pagamento inválida' })
  }),
  type: z.enum(['Assinatura', 'Único'], {
    errorMap: () => ({ message: 'Tipo inválido' })
  }),
  paymentDate: z.date({
    errorMap: () => ({ message: 'Data de pagamento é obrigatória' })
  })
});

// Schema para despesa pessoal
export const personalExpenseSchema = z.object({
  name: z.string()
    .min(2, 'Nome da conta deve ter pelo menos 2 caracteres')
    .max(100, 'Nome da conta deve ter no máximo 100 caracteres')
    .trim(),
  price: z.number()
    .positive('Preço deve ser positivo')
    .max(999999999.99, 'Preço muito alto')
    .refine((val) => Number(val.toFixed(2)) === val, 'Preço deve ter no máximo 2 casas decimais'),
  paymentDate: z.date({
    errorMap: () => ({ message: 'Data de pagamento é obrigatória' })
  }),
  observation: z.string()
    .max(500, 'Observação deve ter no máximo 500 caracteres')
    .optional()
});

// Tipos inferidos dos schemas
export type CompanyRevenueFormData = z.infer<typeof companyRevenueSchema>;
export type CompanyExpenseFormData = z.infer<typeof companyExpenseSchema>;
export type PersonalExpenseFormData = z.infer<typeof personalExpenseSchema>;
