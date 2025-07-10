-- Fase 1: Estrutura do Banco de Dados

-- Criar tabela de receitas da empresa
CREATE TABLE public.company_revenues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  service TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Pix', 'Cartão', 'Outro')),
  contract_type TEXT NOT NULL CHECK (contract_type IN ('único', 'mensal')),
  contract_months INTEGER CHECK (contract_months > 0),
  account_type TEXT NOT NULL CHECK (account_type IN ('Marlon Lopo', 'Infinity B2B')),
  received BOOLEAN NOT NULL DEFAULT false,
  received_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de despesas da empresa
CREATE TABLE public.company_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('Pix', 'Cartão', 'Outro')),
  type TEXT NOT NULL CHECK (type IN ('Assinatura', 'Único')),
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de despesas pessoais
CREATE TABLE public.personal_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  payment_date DATE NOT NULL,
  observation TEXT,
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.company_revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_expenses ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir tudo por enquanto, já que não há autenticação implementada)
CREATE POLICY "Permitir todas as operações em company_revenues" 
ON public.company_revenues 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir todas as operações em company_expenses" 
ON public.company_expenses 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir todas as operações em personal_expenses" 
ON public.personal_expenses 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Função para atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_company_revenues_updated_at
  BEFORE UPDATE ON public.company_revenues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_expenses_updated_at
  BEFORE UPDATE ON public.company_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_expenses_updated_at
  BEFORE UPDATE ON public.personal_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Configurar real-time para todas as tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_revenues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.personal_expenses;

-- Configurar REPLICA IDENTITY para real-time
ALTER TABLE public.company_revenues REPLICA IDENTITY FULL;
ALTER TABLE public.company_expenses REPLICA IDENTITY FULL;
ALTER TABLE public.personal_expenses REPLICA IDENTITY FULL;