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
  created_at?: string;
}