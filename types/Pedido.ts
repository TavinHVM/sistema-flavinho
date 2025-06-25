export interface PedidoItem {
  nome: string;
  quantidade: number;
  valor_unit: number;
  valor_total: number;
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
  endereco: string;
  telefone: string;
  residencial: string;
  referencia: string;
  materiais: PedidoItem[];
  entrega?: string;
  busca?: string;
  pagamento?: string;
  valor_pago?: number;
  valor_total: number;
  desconto: number;
  responsavel_entregou?: string;
  data_entregou?: string;
  responsavel_recebeu?: string;
  data_recebeu?: string;
  responsavel_buscou?: string;
  data_buscou?: string;
  responsavel_conferiu_forro?: string;
  responsavel_conferiu_utensilio?: string;
  created_at?: string;
}
