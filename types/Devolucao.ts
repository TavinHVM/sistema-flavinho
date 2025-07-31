export interface Devolucao {
  id?: string;
  numero_pedido: string;
  nome_produto: string;
  quantidade_devolvida: number;
  responsavel_devolucao: string;
  observacoes?: string;
  data_devolucao?: string;
  created_at?: string;
}

export interface RelatorioItem {
  numero: string;
  cliente: string;
  cpf: string;
  data_evento: string;
  data_devolucao_prevista: string;
  nome_produto: string;
  quantidade_alugada: number;
  quantidade_devolvida: number;
  quantidade_pendente: number;
  data_devolucao_realizada?: string;
  responsavel_devolucao?: string;
  observacoes?: string;
}
