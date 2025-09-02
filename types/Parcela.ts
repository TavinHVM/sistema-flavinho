export interface Parcela {
  id?: string;
  pedido_id?: number;
  numero_parcela: number;
  valor: number; // em centavos
  data_vencimento: string;
  data_pagamento?: string;
  metodo_pagamento?: string;
  status: 'pendente' | 'paga' | 'atrasada';
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ResumoParcelas {
  total_parcelas: number;
  parcelas_pagas: number;
  parcelas_pendentes: number;
  valor_total_parcelas: number; // em centavos
  valor_pago_parcelas: number; // em centavos
  valor_pendente_parcelas: number; // em centavos
}
