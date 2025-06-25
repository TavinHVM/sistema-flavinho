import React from "react";
import OrderMaterialsList from "./OrderMaterialsList";
import { Pedido } from "../types/Pedido";
import { formatDateBR } from "../lib/formatDate";

interface Props {
  pedido: Pedido | null;
  open: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<Props> = ({ pedido, open, onClose }) => {
  if (!pedido) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${open ? '' : 'hidden'}`}>
      <div className="bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Detalhes do Pedido</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-2xl">&times;</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white">
          <div><b>Nº:</b> {pedido.numero}</div>
          <div><b>Data Locação:</b> {formatDateBR(pedido.data_locacao)}</div>
          <div><b>Data Evento:</b> {formatDateBR(pedido.data_evento)}</div>
          <div><b>Data Retirada:</b> {formatDateBR(pedido.data_retirada)}</div>
          <div><b>Data Devolução:</b> {formatDateBR(pedido.data_devolucao)}</div>
          <div><b>Cliente:</b> {pedido.cliente}</div>
          <div><b>CPF:</b> {pedido.cpf}</div>
          <div><b>Telefone:</b> {pedido.telefone}</div>
          <div><b>Endereço Evento:</b> {pedido.endereco}</div>
          <div><b>Endereço Residencial:</b> {pedido.residencial}</div>
          <div><b>Referência:</b> {pedido.referencia}</div>
          <div><b>Entrega:</b> {pedido.entrega}</div>
          <div><b>Busca:</b> {pedido.busca}</div>
          <div><b>Pagamento:</b> {pedido.pagamento}</div>
          <div><b>Valor Pago:</b> R$ {pedido.valor_pago?.toFixed(2)}</div>
          <div><b>Desconto:</b> R$ {pedido.desconto?.toFixed(2)}</div>
          <div><b>Valor Total:</b> R$ {pedido.valor_total?.toFixed(2)}</div>
        </div>
        <div className="mt-4 border-t">
          <h3 className="font-semibold mb-2 mt-4">Materiais</h3>
          <OrderMaterialsList materiais={pedido.materiais} />
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white">
          <div><b>Resp. Entregou:</b> {pedido.responsavel_entregou} <b>Data:</b> {formatDateBR(pedido.data_entregou)}</div>
          <div><b>Resp. Recebeu:</b> {pedido.responsavel_recebeu} <b>Data:</b> {formatDateBR(pedido.data_recebeu)}</div>
          <div><b>Resp. Buscou:</b> {pedido.responsavel_buscou} <b>Data:</b> {formatDateBR(pedido.data_buscou)}</div>
          <div><b>Resp. Conferiu Forro:</b> {pedido.responsavel_conferiu_forro}</div>
          <div><b>Resp. Conferiu Utensílio:</b> {pedido.responsavel_conferiu_utensilio}</div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
