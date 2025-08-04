export interface PedidoItem {
  nome: string;
  quantidade: number;
  valor_unit: number; // em centavos
  valor_total: number; // em centavos
  preco: number; // em centavos
  quantidade_devolvida?: number;
}

export interface Pedido {
  id?: string;
  numero?: number;
  data_locacao: string;
  data_evento: string;
  data_devolucao: string;
  cliente: string;
  cpf: string;
  preco: number; // em centavos
  endereco: string;
  telefone: string;
  residencial: string;
  referencia: string;
  materiais: PedidoItem[];
  pagamento?: string;
  valor_total: number; // em centavos
  valor_pago: number; // em centavos
  valor_deve: number; // em centavos
  // Campos de desconto
  desconto_tipo?: 'valor' | 'porcentagem' | null;
  desconto_valor?: number; // valor em centavos se tipo='valor', porcentagem se tipo='porcentagem'
  valor_desconto?: number; // em centavos
  valor_final?: number; // em centavos
  created_at?: string;
  // Campos de responsabilidades
  resp_entregou?: string;
  data_entregou?: string;
  hora_entregou?: string;
  resp_recebeu?: string;
  data_recebeu?: string;
  hora_recebeu?: string;
  resp_buscou?: string;
  data_buscou?: string;
  hora_buscou?: string;
  resp_forro?: string;
  data_forro?: string;
  hora_forro?: string;
  resp_utensilio?: string;
  data_utensilio?: string;
  hora_utensilio?: string;
  obs?: string;
  // Campos de devolução
  data_devolucao_realizada?: string;
  responsavel_devolucao?: string;
  observacoes_devolucao?: string;
}