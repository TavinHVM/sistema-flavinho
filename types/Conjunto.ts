export interface ConjuntoItem {
  produto_nome: string;
  quantidade: number;
}

export interface Conjunto {
  id?: number;
  numero?: number;
  nome: string;
  descricao?: string;
  preco_promocional: number; // em centavos
  ativo?: boolean;
  itens: ConjuntoItem[];
  created_at?: string;
}

export interface ConjuntoCompleto extends Conjunto {
  itens_detalhados?: {
    produto_nome: string;
    quantidade: number;
    preco_unitario?: number;
    preco_total_individual?: number;
  }[];
  preco_total_individual?: number;
  economia?: number;
}
