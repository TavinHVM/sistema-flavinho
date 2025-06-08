import React from "react";
import { FaTrash, FaEdit, FaFilePdf } from "react-icons/fa";

interface PedidoItem {
  nome: string;
  quantidade: number;
  valor_unit?: number;
  valor_total?: number;
}

interface Pedido {
  id: string;
  numero: string;
  cliente: string;
  cpf?: string;
  data_locacao: string;
  data_evento?: string;
  data_retirada?: string;
  data_devolucao?: string;
  endereco?: string;
  telefone?: string;
  residencial?: string;
  referencia?: string;
  materiais: PedidoItem[];
  entrega?: string;
  busca?: string;
  pagamento?: string;
  valor_pago?: number;
  valor_total?: number;
  responsavel_entregou?: string;
  data_entregou?: string;
  responsavel_recebeu?: string;
  data_recebeu?: string;
  responsavel_buscou?: string;
  data_buscou?: string;
  responsavel_conferiu_forro?: string;
  responsavel_conferiu_utensilio?: string;
}

interface OrderListProps {
  pedidos: Pedido[];
  search: string;
  onEditar?: (pedido: Pedido) => void;
  onExcluir?: (id: string) => void;
  onExportarPDF?: (pedido: Pedido) => void;
}

const OrderList: React.FC<OrderListProps> = ({ pedidos, search, onEditar, onExcluir, onExportarPDF }) => {
  const pedidosFiltrados = pedidos.filter((p) =>
    p.cliente.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs bg-gray-900 rounded">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">Nº</th>
            <th className="p-2">Cliente</th>
            <th className="p-2">CPF</th>
            <th className="p-2">Data Locação</th>
            <th className="p-2">Data Evento</th>
            <th className="p-2">Data Retirada</th>
            <th className="p-2">Data Devolução</th>
            <th className="p-2">Endereço</th>
            <th className="p-2">Telefone</th>
            <th className="p-2">Materiais</th>
            <th className="p-2">Entrega</th>
            <th className="p-2">Busca</th>
            <th className="p-2">Pagamento</th>
            <th className="p-2">Valor Pago</th>
            <th className="p-2">Valor Total</th>
            <th className="p-2">Resp. Entregou</th>
            <th className="p-2">Data Entrega</th>
            <th className="p-2">Resp. Recebeu</th>
            <th className="p-2">Data Recebeu</th>
            <th className="p-2">Resp. Buscou</th>
            <th className="p-2">Data Busca</th>
            <th className="p-2">Conf. Forro</th>
            <th className="p-2">Conf. Utensílio</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidosFiltrados.map((p) => (
            <tr key={p.id} className="border-b border-gray-800">
              <td className="p-2">{p.numero}</td>
              <td className="p-2">{p.cliente}</td>
              <td className="p-2">{p.cpf}</td>
              <td className="p-2">{p.data_locacao}</td>
              <td className="p-2">{p.data_evento}</td>
              <td className="p-2">{p.data_retirada}</td>
              <td className="p-2">{p.data_devolucao}</td>
              <td className="p-2">{p.endereco}</td>
              <td className="p-2">{p.telefone}</td>
              <td className="p-2">{p.materiais.map((m: any) => `${m.nome} (${m.quantidade})`).join(", ")}</td>
              <td className="p-2">{p.entrega}</td>
              <td className="p-2">{p.busca}</td>
              <td className="p-2">{p.pagamento}</td>
              <td className="p-2">R$ {p.valor_pago?.toFixed(2)}</td>
              <td className="p-2">R$ {p.valor_total?.toFixed(2)}</td>
              <td className="p-2">{p.responsavel_entregou}</td>
              <td className="p-2">{p.data_entregou}</td>
              <td className="p-2">{p.responsavel_recebeu}</td>
              <td className="p-2">{p.data_recebeu}</td>
              <td className="p-2">{p.responsavel_buscou}</td>
              <td className="p-2">{p.data_buscou}</td>
              <td className="p-2">{p.responsavel_conferiu_forro}</td>
              <td className="p-2">{p.responsavel_conferiu_utensilio}</td>
              <td className="p-2">
                <div className="flex gap-1 flex-wrap">
                  {onExportarPDF && (
                    <button className="bg-gray-700 text-white rounded px-2 py-1 text-xs flex items-center gap-1" onClick={() => onExportarPDF(p)} title="Exportar PDF">
                      <FaFilePdf /> PDF
                    </button>
                  )}
                  {onEditar && (
                    <button className="bg-blue-600 text-white rounded px-2 py-1 text-xs flex items-center gap-1" onClick={() => onEditar(p)} title="Editar">
                      <FaEdit /> Editar
                    </button>
                  )}
                  {onExcluir && (
                    <button className="bg-red-600 text-white rounded px-2 py-1 text-xs flex items-center gap-1" onClick={() => onExcluir(p.id)} title="Excluir">
                      <FaTrash /> Excluir
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderList;
