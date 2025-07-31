import React, { useState } from "react";
import { FaSortUp, FaSortDown } from "react-icons/fa";
import OrderDetailsModal from "./OrderDetailsModal";
import { Pedido } from "../types/Pedido";
import { formatDateBR } from "../lib/formatDate";
import { formatCpfCnpjBR } from "@/lib/formatCpfCnpj";

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
  onDevolucao?: (pedido: Pedido, itensDevolvidos: { nome: string; quantidade: number; devolucao_atual: number }[], observacoes: string) => void;
}

type SortKey = "numero" | "cpf" | "cliente" | "data_locacao" | "data_evento" | "data_devolucao" | "endereco" | "valor_total" | "valor_pago" | "valor_deve" | null;
type SortOrder = "asc" | "desc" | null;

const OrderList: React.FC<OrderListProps> = ({ pedidos, search, onEditar, onExcluir, onDevolucao }) => {
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

  // Filtrar pedidos baseado na busca
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      pedido.cliente.toLowerCase().includes(searchLower) ||
      pedido.cpf.includes(search) ||
      (pedido.numero?.toString() || '').includes(search) ||
      pedido.endereco.toLowerCase().includes(searchLower)
    );
  });

  const pedidosOrdenados = (() => {
    if (!sortKey || !sortOrder) return pedidosFiltrados;
    return [...pedidosFiltrados].sort((a, b) => {
      const aValue: unknown = a[sortKey as keyof typeof a];
      const bValue: unknown = b[sortKey as keyof typeof b];

      // Para valor_total, valor_pago, valor_deve garantir número
      if (sortKey === "valor_total" || sortKey === "valor_pago" || sortKey === "valor_deve") {
        const aNum = typeof aValue === "number" ? aValue : Number(aValue) || 0;
        const bNum = typeof bValue === "number" ? bValue : Number(bValue) || 0;
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }
      // Para datas, comparar como string
      if (sortKey === "data_locacao" || sortKey === "data_evento" || sortKey === "data_devolucao") {
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
      <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-left text-white uppercase text-xs tracking-wider">
            <th className="p-3 min-w-[60px] cursor-pointer select-none" onClick={() => handleSort("numero")}>
              <span className="flex items-center">
                Nº {getSortIcon("numero")}
              </span>
            </th>
            <th className="p-3 min-w-[120px] cursor-pointer select-none" onClick={() => handleSort("cpf")}>
              <span className="flex items-center">
                CPF/CNPJ {getSortIcon("cpf")}
              </span>
            </th>
            <th className="p-3 min-w-[140px] cursor-pointer select-none" onClick={() => handleSort("cliente")}>
              <span className="flex items-center">
                Cliente {getSortIcon("cliente")}
              </span>
            </th>
            <th className="p-3 min-w-[110px] cursor-pointer select-none" onClick={() => handleSort("data_locacao")}>
              <span className="flex items-center gap-1">
                Data Locação {getSortIcon("data_locacao")}
              </span>
            </th>
            <th className="p-3 min-w-[110px] cursor-pointer select-none" onClick={() => handleSort("data_evento")}>
              <span className="flex items-center gap-1">
                Data Evento {getSortIcon("data_evento")}
              </span>
            </th>
            <th className="p-3 min-w-[110px] cursor-pointer select-none" onClick={() => handleSort("data_devolucao")}>
              <span className="flex items-center gap-1">
                Data Devolução {getSortIcon("data_devolucao")}
              </span>
            </th>
            <th className="p-3 min-w-[140px] cursor-pointer select-none" onClick={() => handleSort("endereco")}>
              <span className="flex items-center gap-1">
                Local do Evento {getSortIcon("endereco")}
              </span>
            </th>
            <th className="p-3 min-w-[80px] cursor-pointer select-none" onClick={() => handleSort("valor_total")}>
              <span className="flex items-center gap-1">
                Total {getSortIcon("valor_total")}
              </span>
            </th>
            <th className="p-3 min-w-[80px] cursor-pointer select-none" onClick={() => handleSort("valor_pago")}>
              <span className="flex items-center gap-1">
                Pago {getSortIcon("valor_pago")}
              </span>
            </th>
            <th className="p-3 min-w-[80px] cursor-pointer select-none" onClick={() => handleSort("valor_deve")}>
              <span className="flex items-center gap-1">
                Devido {getSortIcon("valor_deve")}
              </span>
            </th>
            <th className="p-3 min-w-[100px]">Status Devolução</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {pedidosOrdenados.map((p, idx) => (
            <tr
              key={p.id || p.numero || idx}
              className="hover:bg-gray-800 transition-colors duration-150 cursor-pointer even:bg-gray-900 odd:bg-gray-950"
              onClick={() => handleVerMais(p)}
            >
              <td className="p-3 text-gray-400">{p.numero}</td>
              <td className="p-3 text-gray-300 font font-semibold">{formatCpfCnpjBR(p.cpf)}</td>
              <td className="p-3 text-gray-50 font-semibold">{p.cliente}</td>
              <td className="p-3 text-gray-300 font-semibold">{formatDateBR(p.data_locacao)}</td>
              <td className="p-3 text-gray-300 font-semibold">{formatDateBR(p.data_evento) || '-'}</td>
              <td className="p-3 text-gray-300 font-semibold">
                {(() => {
                  if (!p.data_devolucao) return '-';

                  const hoje = new Date();
                  const dataDevolucao = new Date(p.data_devolucao);
                  const diasParaDevolucao = Math.ceil((dataDevolucao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

                  // Verificar se há itens pendentes
                  const totalItens = p.materiais?.reduce((total, item) => total + item.quantidade, 0) || 0;
                  const totalDevolvido = p.materiais?.reduce((total, item) => total + (item.quantidade_devolvida || 0), 0) || 0;
                  const pendente = totalItens - totalDevolvido;

                  if (pendente === 0) {
                    return <span className="text-green-400">{formatDateBR(p.data_devolucao)}</span>;
                  } else if (diasParaDevolucao <= 0) {
                    return <span className="text-red-400 font-bold">{formatDateBR(p.data_devolucao)} 🔴</span>;
                  } else if (diasParaDevolucao <= 2) {
                    return <span className="text-yellow-400 font-bold">{formatDateBR(p.data_devolucao)} ⚠️</span>;
                  } else {
                    return <span className="text-gray-300">{formatDateBR(p.data_devolucao)}</span>;
                  }
                })()}
              </td>
              <td className="p-3 text-gray-300 font-semibold">{p.endereco || '-'}</td>
              <td className="p-3 text-gray-300 font-bold">
                <span className="font-bold text-emerald-400">
                  {p.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </td>
              <td className="p-3 text-gray-300 font-bold">
                <span className="font-bold text-green-400">
                  {p.valor_pago?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                </span>
              </td>
              <td className="p-3 text-gray-300 font-bold">
                <span className={`font-bold ${(p.valor_deve || 0) > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {p.valor_deve?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                </span>
              </td>
              <td className="p-3">
                {(() => {
                  const totalItens = p.materiais?.reduce((total, item) => total + item.quantidade, 0) || 0;
                  const totalDevolvido = p.materiais?.reduce((total, item) => total + (item.quantidade_devolvida || 0), 0) || 0;
                  const pendente = totalItens - totalDevolvido;

                  // Verificar se está próximo da data de devolução
                  const hoje = new Date();
                  const dataDevolucao = p.data_devolucao ? new Date(p.data_devolucao) : null;
                  const diasParaDevolucao = dataDevolucao ? Math.ceil((dataDevolucao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)) : null;

                  if (totalItens === 0) {
                    return <span className="text-gray-400 text-xs">Sem itens</span>;
                  } else if (pendente === 0) {
                    return (
                      <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-600/30">
                        ✓ Devolvido
                      </span>
                    );
                  } else if (totalDevolvido > 0) {
                    const urgencia = diasParaDevolucao !== null && diasParaDevolucao <= 0 ? ' 🔴' : diasParaDevolucao !== null && diasParaDevolucao <= 2 ? ' ⚠️' : '';
                    return (
                      <span className="bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium border border-yellow-600/30">
                        ⚠ Parcial ({pendente} pendente){urgencia}
                      </span>
                    );
                  } else {
                    const urgencia = diasParaDevolucao !== null && diasParaDevolucao <= 0 ? ' 🔴' : diasParaDevolucao !== null && diasParaDevolucao <= 2 ? ' ⚠️' : '';
                    return (
                      <span className="bg-red-900/30 text-red-400 px-2 py-1 rounded-full text-xs font-medium border border-red-600/30">
                        ⏳ Pendente ({pendente} itens){urgencia}
                      </span>
                    );
                  }
                })()}
              </td>
              <td className="p-3"></td>
            </tr>
          ))}
        </tbody>
      </table>
      <OrderDetailsModal pedido={modalPedido} open={modalOpen} onClose={handleCloseModal}
        onEditar={onEditar}
        onExcluir={onExcluir}
        onDevolucao={onDevolucao}
      />
    </div>
  );
};

export default OrderList;
