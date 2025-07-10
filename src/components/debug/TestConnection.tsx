import { useEffect, useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Database, TrendingUp, Building2, User } from 'lucide-react';

export const TestConnection = () => {
  const { 
    companyRevenues, 
    companyExpenses, 
    personalExpenses, 
    isLoading, 
    error,
    saveRevenue,
    saveCompanyExpense,
    savePersonalExpense
  } = useFinanceData();
  
  const [testResults, setTestResults] = useState({
    connection: false,
    dataLoading: false,
    formsWorking: false
  });

  useEffect(() => {
    // Test connection
    setTestResults(prev => ({
      ...prev,
      connection: !error,
      dataLoading: !isLoading
    }));
  }, [error, isLoading]);

  const testAddRevenue = async () => {
    try {
      await saveRevenue({
        clientName: "Cliente Teste",
        service: "Serviço de Teste",
        price: 1000,
        paymentMethod: "Pix" as const,
        contractType: "único" as const,
        paymentDate: new Date(),
        accountType: "Marlon Lopo" as const,
        received: false
      });
      setTestResults(prev => ({ ...prev, formsWorking: true }));
      alert("✅ Teste de receita bem-sucedido!");
    } catch (error) {
      console.error("Erro no teste de receita:", error);
      alert("❌ Erro no teste de receita");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Teste de Conexão - Supabase
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            {testResults.connection ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>Conexão</span>
          </div>

          <div className="flex items-center gap-2">
            {testResults.dataLoading ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>Carregamento</span>
          </div>

          <div className="flex items-center gap-2">
            {testResults.formsWorking ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-gray-400" />
            )}
            <span>Formulários</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Receitas: {companyRevenues.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-red-400" />
            <span>Desp. Emp.: {companyExpenses.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-500" />
            <span>Desp. Pes.: {personalExpenses.length}</span>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={testAddRevenue}
            className="w-full"
            disabled={isLoading}
          >
            Testar Adição de Receita
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            Erro: {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
};