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
  valor_total?: number;
  materiais: PedidoItem[];
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
            <th className="p-2">Data</th>
            <th className="p-2">Total</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidosFiltrados.map((p) => (
            <tr key={p.id} className="border-b border-gray-800">
              <td className="p-2">{p.numero}</td>
              <td className="p-2">{p.cliente}</td>
              <td className="p-2">{p.data_locacao}</td>
              <td className="p-2">R$ {p.valor_total?.toFixed(2)}</td>
              <td className="p-2">
                <div className="flex gap-1 flex-wrap">
                  {onExportarPDF && (
                    <button key="pdf" className="bg-gray-700 text-white rounded px-2 py-1 text-xs flex items-center gap-1" onClick={() => onExportarPDF(p)} title="Exportar PDF">
                      <FaFilePdf /> PDF
                    </button>
                  )}
                  {onEditar && (
                    <button key="edit" className="bg-blue-600 text-white rounded px-2 py-1 text-xs flex items-center gap-1" onClick={() => onEditar(p)} title="Editar">
                      <FaEdit /> Editar
                    </button>
                  )}
                  {onExcluir && (
                    <button key="delete" className="bg-red-600 text-white rounded px-2 py-1 text-xs flex items-center gap-1" onClick={() => onExcluir(p.id)} title="Excluir">
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
