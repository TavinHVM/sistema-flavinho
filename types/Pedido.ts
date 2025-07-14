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
  data_retirada?: string;
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
  responsavel_entregou?: string;
  data_entregou?: string;
  responsavel_recebeu?: string;
  data_recebeu?: string;
  responsavel_buscou?: string;
  data_buscou?: string;
  responsavel_conferiu_forro?: string;
  responsavel_conferiu_utensilio?: string;
  created_at?: string;
  horario_entregou?: string; // HH:mm
  horario_recebeu?: string; // HH:mm
  horario_buscou?: string; // HH:mm
}
