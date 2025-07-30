export interface PedidoItem {
  nome: string;
  quantidade: number;
  valor_unit: number;
  valor_total: number;
  preco: number;
}

export interface Pedido {
  id?: string;
  numero?: string;
  data_locacao: string;
  data_evento: string;
  data_devolucao: string;
  cliente: string;
  cpf: string;
  preco: number;
  endereco: string;
  telefone: string;
  residencial: string;
  referencia: string;
  materiais: PedidoItem[];
  pagamento?: string;
  valor_total: number;
  valor_pago: number;
  valor_deve: number;
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
}