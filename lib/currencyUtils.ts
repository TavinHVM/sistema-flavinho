// Utilitários para conversão de moeda entre centavos e reais

/**
 * Converte valor em reais para centavos (para armazenar no banco)
 * @param reais - Valor em reais (ex: 12.50)
 * @returns Valor em centavos (ex: 1250)
 */
export function reaisParaCentavos(reais: number): number {
  return Math.round(reais * 100);
}

/**
 * Converte valor em centavos para reais (para exibir no frontend)
 * @param centavos - Valor em centavos (ex: 1250)
 * @returns Valor em reais (ex: 12.50)
 */
export function centavosParaReais(centavos: number): number {
  return centavos / 100;
}

/**
 * Formata valor em centavos para exibição como moeda brasileira
 * @param centavos - Valor em centavos
 * @returns String formatada (ex: "R$ 12,50")
 */
export function formatarMoedaDeCentavos(centavos: number): string {
  const reais = centavosParaReais(centavos);
  return reais.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formata valor em centavos para input (sem símbolo de moeda)
 * @param centavos - Valor em centavos
 * @returns String formatada (ex: "12,50")
 */
export function formatarInputDeCentavos(centavos: number): string {
  const reais = centavosParaReais(centavos);
  return reais.toLocaleString('pt-BR', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Converte string de input para centavos
 * @param inputValue - Valor do input (ex: "12,50" ou "12.50")
 * @returns Valor em centavos
 */
export function inputParaCentavos(inputValue: string): number {
  if (!inputValue) return 0;
  
  // Remove tudo exceto números, vírgulas e pontos
  const cleaned = inputValue.replace(/[^\d,.-]/g, '');
  
  // Substitui vírgula por ponto para parsing
  const normalized = cleaned.replace(',', '.');
  
  const reais = parseFloat(normalized) || 0;
  return reaisParaCentavos(reais);
}

/**
 * Converte string numérica com apenas números para centavos (para campos de input mascarados)
 * @param numericString - String com apenas números (ex: "1250")
 * @returns Valor em centavos
 */
export function stringNumericaParaCentavos(numericString: string): number {
  const numero = parseInt(numericString, 10) || 0;
  return numero; // Já está em centavos
}
