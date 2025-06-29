import React, { useState } from "react";
import { FaTrash, FaEdit, FaSortUp, FaSortDown } from "react-icons/fa";
import OrderDetailsModal from "./OrderDetailsModal";
import { Pedido } from "../types/Pedido";
import { formatDateBR } from "../lib/formatDate";

interface Material {
  nome: string;
  quantidade: number;
  valor_unit: number;
  valor_total: number;
}

interface OrderListProps {
  pedidos: (Pedido & { materiais: Material[] })[];
  search: string;
  onEditar?: (pedido: Pedido & { materiais: Material[] }) => void;
  onExcluir?: (id: number) => void;
}

type SortKey = "numero" | "cliente" | "data_locacao" | "data_evento" | "endereco" | "valor_total" | null;
type SortOrder = "asc" | "desc" | null;

const OrderList: React.FC<OrderListProps> = ({ pedidos, search, onEditar, onExcluir }) => {
  const [modalPedido, setModalPedido] = useState<Pedido | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else if (sortOrder === "desc") {
      setSortKey(null);
      setSortOrder(null);
    } else {
      setSortOrder("asc");
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key || !sortOrder) return null;
    if (sortOrder === "asc") return <FaSortUp className="inline ml-1" />;
    if (sortOrder === "desc") return <FaSortDown className="inline ml-1" />;
    return null;
  };

  const handleVerMais = (pedido: Pedido) => {
    setModalPedido(pedido);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalPedido(null);
  };

  const pedidosFiltrados = pedidos.filter((p) =>
    p.cliente.toLowerCase().includes(search.toLowerCase())
  );

  const pedidosOrdenados = (() => {
    if (!sortKey || !sortOrder) return pedidosFiltrados;
    return [...pedidosFiltrados].sort((a, b) => {
      const aValue: unknown = a[sortKey as keyof typeof a];
      const bValue: unknown = b[sortKey as keyof typeof b];

      // Para valor_total, garantir número
      if (sortKey === "valor_total") {
        const aNum = typeof aValue === "number" ? aValue : Number(aValue) || 0;
        const bNum = typeof bValue === "number" ? bValue : Number(bValue) || 0;
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }
      // Para datas, comparar como string
      if (sortKey === "data_locacao" || sortKey === "data_evento") {
        const aStr = (aValue ?? "") as string;
        const bStr = (bValue ?? "") as string;
        return sortOrder === "asc"
          ? String(aStr).localeCompare(String(bStr))
          : String(bStr).localeCompare(String(aStr));
      }
      // Para número do pedido (pode ser string ou número)
      if (sortKey === "numero") {
        const aStr = (aValue ?? "") as string;
        const bStr = (bValue ?? "") as string;
        return sortOrder === "asc"
          ? String(aStr).localeCompare(String(bStr), undefined, { numeric: true })
          : String(bStr).localeCompare(String(aStr), undefined, { numeric: true });
      }
      // Para strings
      const aStr = (aValue ?? "").toString().toLowerCase();
      const bStr = (bValue ?? "").toString().toLowerCase();
      return sortOrder === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  })();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs bg-gray-900 rounded">
        <thead>
          <tr className="bg-gray-700">
            <th
              className="p-2 cursor-pointer select-none min-w-[60px]"
              onClick={() => handleSort("numero")}
            >
              <span className="flex items-center gap-1">
                Nº {getSortIcon("numero")}
              </span>
            </th>
            <th
              className="p-2 cursor-pointer select-none min-w-[140px]"
              onClick={() => handleSort("cliente")}
            >
              <span className="flex items-center gap-1">
                Cliente {getSortIcon("cliente")}
              </span>
            </th>
            <th
              className="p-2 cursor-pointer select-none min-w-[110px]"
              onClick={() => handleSort("data_locacao")}
            >
              <span className="flex items-center gap-1">
                Data Locação {getSortIcon("data_locacao")}
              </span>
            </th>
            <th
              className="p-2 cursor-pointer select-none min-w-[110px]"
              onClick={() => handleSort("data_evento")}
            >
              <span className="flex items-center gap-1">
                Data Evento {getSortIcon("data_evento")}
              </span>
            </th>
            <th
              className="p-2 cursor-pointer select-none min-w-[140px]"
              onClick={() => handleSort("endereco")}
            >
              <span className="flex items-center gap-1">
                Local do Evento {getSortIcon("endereco")}
              </span>
            </th>
            <th
              className="p-2 cursor-pointer select-none min-w-[80px]"
              onClick={() => handleSort("valor_total")}
            >
              <span className="flex items-center gap-1">
                Total {getSortIcon("valor_total")}
              </span>
            </th>
            <th className="p-2 min-w-[110px]">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidosOrdenados.map((p, idx) => (
            <tr key={p.id || p.numero || idx} className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer" onClick={() => handleVerMais(p)}>
              <td className="p-2">{p.numero}</td>
              <td className="p-2">{p.cliente}</td>
              <td className="p-2">{formatDateBR(p.data_locacao)}</td>
              <td className="p-2">{formatDateBR(p.data_evento) || '-'}</td>
              <td className="p-2">{p.endereco || '-'}</td>
              <td className="p-2">R$ {p.valor_total?.toFixed(2)}</td>
              <td className="p-2" onClick={e => e.stopPropagation()}>
                <div className="flex gap-1 flex-wrap">
                  {onEditar && (
                    <button
                      key="edit"
                      className="bg-blue-600 text-white rounded px-2 py-1 text-xs flex items-center justify-center gap-1 min-w-[80px]"
                      onClick={() => onEditar({
                        ...p,
                        materiais: p.materiais ?? [],
                        numero: typeof p.numero === "string" ? p.numero : String(p.numero),
                        data_locacao: p.data_locacao ?? "",
                        data_evento: p.data_evento ?? "",
                        data_retirada: p.data_retirada ?? "",
                        data_devolucao: p.data_devolucao ?? "",
                        cliente: p.cliente ?? "",
                        cpf: p.cpf ?? "",
                        endereco: p.endereco ?? "",
                        telefone: p.telefone ?? "",
                        residencial: p.residencial ?? "",
                        referencia: p.referencia ?? "",
                        entrega: p.entrega ?? "",
                        busca: p.busca ?? "",
                        pagamento: p.pagamento ?? "",
                        valor_pago: p.valor_pago ?? 0,
                        valor_total: p.valor_total ?? 0,
                        responsavel_entregou: p.responsavel_entregou ?? "",
                        data_entregou: p.data_entregou ?? "",
                        responsavel_recebeu: p.responsavel_recebeu ?? "",
                        data_recebeu: p.data_recebeu ?? "",
                        responsavel_buscou: p.responsavel_buscou ?? "",
                        data_buscou: p.data_buscou ?? "",
                        responsavel_conferiu_forro: p.responsavel_conferiu_forro ?? "",
                        responsavel_conferiu_utensilio: p.responsavel_conferiu_utensilio ?? "",
                        desconto: p.desconto ?? 0,
                      })}
                      title="Editar"
                    >
                      <FaEdit /> Editar
                    </button>
                  )}
                  {onExcluir && p.numero && (
                    <button
                      key="delete"
                      className="bg-red-600 text-white rounded px-2 py-1 text-xs flex items-center justify-center gap-1 min-w-[80px]"
                      onClick={() => onExcluir(Number(p.numero))}
                      title="Excluir"
                    >
                      <FaTrash /> Excluir
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <OrderDetailsModal pedido={modalPedido} open={modalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default OrderList;
