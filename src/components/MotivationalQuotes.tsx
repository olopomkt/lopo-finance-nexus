
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const motivationalQuotes = [
  "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
  "Sua renda raramente excede seu desenvolvimento pessoal.",
  "O dinheiro é apenas uma ferramenta. Te levará onde você quiser, mas não irá substituir você como motorista.",
  "Investir em conhecimento rende sempre os melhores juros.",
  "A riqueza não é sobre ter muito dinheiro; é sobre ter muitas opções.",
  "Não trabalhe por dinheiro; faça o dinheiro trabalhar para você.",
  "O empreendedorismo é viver alguns anos da sua vida como a maioria das pessoas não vai viver, para viver o resto da sua vida como a maioria das pessoas não pode viver.",
  "A diferença entre ser rico e ser milionário é o conhecimento.",
  "Você não precisa ser grande para começar, mas precisa começar para ser grande.",
  "O maior risco é não correr nenhum risco.",
  "A persistência é o caminho do êxito.",
  "Oportunidades não surgem. Você as cria.",
  "A disciplina é a ponte entre metas e conquistas.",
  "Invista em si mesmo. Seu eu futuro agradecerá.",
  "A liberdade financeira está disponível para aqueles que aprendem sobre ela e trabalham para conquistá-la."
];

export const MotivationalQuotes = () => {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  useEffect(() => {
    // Função para calcular qual frase deve ser exibida baseada no tempo
    const calculateQuoteIndex = () => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const hoursPassed = Math.floor((now.getTime() - startOfDay.getTime()) / (1000 * 60 * 60));
      
      // Troca a cada 12 horas (0-11 -> primeira frase, 12-23 -> segunda frase do dia)
      const quotesPerDay = 2;
      const dayOfYear = Math.floor(now.getTime() / (1000 * 60 * 60 * 24));
      const quoteIndex = ((dayOfYear * quotesPerDay) + Math.floor(hoursPassed / 12)) % motivationalQuotes.length;
      
      return quoteIndex;
    };

    const updateQuote = () => {
      setCurrentQuoteIndex(calculateQuoteIndex());
    };

    // Atualiza imediatamente
    updateQuote();

    // Verifica a cada minuto se precisa trocar a frase
    const interval = setInterval(updateQuote, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
        Marlon Lopo - Evolution
      </h1>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentQuoteIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-lg md:text-xl text-muted-foreground italic max-w-4xl mx-auto px-4"
        >
          "{motivationalQuotes[currentQuoteIndex]}"
        </motion.p>
      </AnimatePresence>
    </div>
  );
};
