import React, { useState } from "react";
import { FaSortUp, FaSortDown, FaCheckSquare, FaSquare, FaTrashAlt } from "react-icons/fa";
import OrderDetailsModal from "./OrderDetailsModal";
import MultipleSelectionBar from "./MultipleSelectionBar";
import { Pedido } from "../types/Pedido";
import { formatDateBR } from "../lib/formatDate";
import { formatCpfCnpjBR } from "@/lib/formatCpfCnpj";
import { useMultipleSelection } from "../hooks/useMultipleSelection";
import { formatarMoedaDeCentavos } from "@/lib/currencyUtils";

interface Material {
  nome: string;
  quantidade: number;
  valor_unit: number; // em centavos
  valor_total: number; // em centavos
}

interface OrderListProps {
  pedidos: (Pedido & { materiais: Material[] })[];
  search: string;
  onEditar?: (pedido: Pedido & { materiais: Material[] }) => void;
  onExcluir?: (id: number) => void;
  onExcluirMultiplos?: (ids: number[]) => void;
  onDevolucao?: (pedido: Pedido, itensDevolvidos: { nome: string; quantidade: number; devolucao_atual: number }[], observacoes: string) => void;
}

type SortKey = "numero" | "cpf" | "cliente" | "data_locacao" | "data_evento" | "data_devolucao" | "endereco" | "valor_total" | "valor_pago" | "valor_deve" | null;
type SortOrder = "asc" | "desc" | null;

const OrderList: React.FC<OrderListProps> = ({ pedidos, search, onEditar, onExcluir, onExcluirMultiplos, onDevolucao }) => {
  const [modalPedido, setModalPedido] = useState<Pedido | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Hook para seleção múltipla
  const multipleSelection = useMultipleSelection({
    items: pedidos,
    getItemId: (pedido) => pedido.numero || 0,
  });

  const handleDeleteSelected = () => {
    if (onExcluirMultiplos && multipleSelection.hasSelections) {
      const selectedIds = multipleSelection.getSelectedItemsData().map(pedido => pedido.numero || 0);
      onExcluirMultiplos(selectedIds);
      multipleSelection.exitSelectionMode();
    }
  };

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
        
        // Para valor_total, considerar valor_final se houver desconto
        if (sortKey === "valor_total") {
          const aFinal = a.valor_final && a.valor_final !== a.valor_total ? a.valor_final : aNum;
          const bFinal = b.valor_final && b.valor_final !== b.valor_total ? b.valor_final : bNum;
          return sortOrder === "asc" ? aFinal - bFinal : bFinal - aFinal;
        }
        
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
    <>
      <MultipleSelectionBar
        isVisible={multipleSelection.isSelectionMode}
        selectedCount={multipleSelection.selectedCount}
        isAllSelected={multipleSelection.isAllSelected}
        isPartiallySelected={multipleSelection.isPartiallySelected}
        onToggleAll={multipleSelection.toggleAll}
        onDeleteSelected={handleDeleteSelected}
        onCancel={multipleSelection.exitSelectionMode}
        itemName="pedidos"
      />
      
      <div className="overflow-x-auto" style={{ marginTop: multipleSelection.isSelectionMode ? '60px' : '0' }}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {!multipleSelection.isSelectionMode && onExcluirMultiplos && (
              <button
                onClick={multipleSelection.enterSelectionMode}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded flex items-center gap-2 transition-colors text-sm"
                title="Ativar modo de seleção múltipla"
              >
                <FaTrashAlt />
                Seleção Múltipla
              </button>
            )}
          </div>
        </div>

        <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-700 text-left text-white uppercase text-xs tracking-wider">
              {multipleSelection.isSelectionMode && (
                <th className="p-3 w-12">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      multipleSelection.toggleAll();
                    }}
                    className="text-white hover:text-gray-300 transition-colors"
                    title={multipleSelection.isAllSelected ? "Desmarcar todos" : "Selecionar todos"}
                  >
                    {multipleSelection.isAllSelected ? (
                      <FaCheckSquare className="text-lg" />
                    ) : multipleSelection.isPartiallySelected ? (
                      <FaCheckSquare className="text-lg opacity-50" />
                    ) : (
                      <FaSquare className="text-lg" />
                    )}
                  </button>
                </th>
              )}
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
        <tbody className="divide-y divide-gray-800 cursor-pointer">
          {pedidosOrdenados.map((p, idx) => (
            <tr
              key={p.id || p.numero || idx}
              className={`hover:bg-gray-800 transition-colors duration-150 even:bg-gray-900 odd:bg-gray-950 ${
                multipleSelection.isSelectionMode && multipleSelection.isSelected(p) 
                  ? 'bg-blue-900/30 border-l-4 border-blue-500' 
                  : ''
              }`}
              onClick={!multipleSelection.isSelectionMode ? () => handleVerMais(p) : undefined}
            >
              {multipleSelection.isSelectionMode && (
                <td className="p-3 w-12">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      multipleSelection.toggleItem(p);
                    }}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {multipleSelection.isSelected(p) ? (
                      <FaCheckSquare className="text-lg text-blue-400" />
                    ) : (
                      <FaSquare className="text-lg" />
                    )}
                  </button>
                </td>
              )}
              <td 
                className={`p-3 text-gray-400 ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                onClick={multipleSelection.isSelectionMode ? (e) => {
                  e.stopPropagation();
                  multipleSelection.toggleItem(p);
                } : undefined}
              >
                {p.numero}
              </td>
              <td 
                className={`p-3 text-gray-300 font-semibold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                onClick={multipleSelection.isSelectionMode ? (e) => {
                  e.stopPropagation();
                  multipleSelection.toggleItem(p);
                } : undefined}
              >
                {formatCpfCnpjBR(p.cpf)}
              </td>
              <td 
                className={`p-3 text-gray-50 font-semibold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                onClick={multipleSelection.isSelectionMode ? (e) => {
                  e.stopPropagation();
                  multipleSelection.toggleItem(p);
                } : undefined}
              >
                {p.cliente}
              </td>
              <td 
                className={`p-3 text-gray-300 font-semibold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                onClick={multipleSelection.isSelectionMode ? (e) => {
                  e.stopPropagation();
                  multipleSelection.toggleItem(p);
                } : undefined}
              >
                {formatDateBR(p.data_locacao)}
              </td>
              <td 
                className={`p-3 text-gray-300 font-semibold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                onClick={multipleSelection.isSelectionMode ? (e) => {
                  e.stopPropagation();
                  multipleSelection.toggleItem(p);
                } : undefined}
              >
                {formatDateBR(p.data_evento) || '-'}
              </td>
              <td 
                className={`p-3 text-gray-300 font-semibold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                onClick={multipleSelection.isSelectionMode ? (e) => {
                  e.stopPropagation();
                  multipleSelection.toggleItem(p);
                } : undefined}
              >
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
              <td 
                className={`p-3 text-gray-300 font-semibold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                onClick={multipleSelection.isSelectionMode ? (e) => {
                  e.stopPropagation();
                  multipleSelection.toggleItem(p);
                } : undefined}
              >
                {p.endereco || '-'}
              </td>
              <td 
                className={`p-3 text-gray-300 font-bold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                onClick={multipleSelection.isSelectionMode ? (e) => {
                  e.stopPropagation();
                  multipleSelection.toggleItem(p);
                } : undefined}
              >
                <span className="font-bold text-emerald-400">
                  {/* Mostrar valor final se houver desconto, senão mostrar valor total */}
                  {p.valor_final && p.valor_final !== p.valor_total 
                    ? formatarMoedaDeCentavos(p.valor_final)
                    : formatarMoedaDeCentavos(p.valor_total || 0)
                  }
                  {/* Indicador de desconto */}
                  {p.valor_final && p.valor_final !== p.valor_total && (
                    <span className="ml-1 text-xs text-yellow-400" title={`Desconto aplicado. Valor bruto: ${formatarMoedaDeCentavos(p.valor_total || 0)}`}>
                      🏷️
                    </span>
                  )}
                </span>
              </td>
              <td 
                className={`p-3 text-gray-300 font-bold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                onClick={multipleSelection.isSelectionMode ? (e) => {
                  e.stopPropagation();
                  multipleSelection.toggleItem(p);
                } : undefined}
              >
                <span className="font-bold text-green-400">
                  {formatarMoedaDeCentavos(p.valor_pago || 0)}
                </span>
              </td>
              <td 
                className={`p-3 text-gray-300 font-bold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                onClick={multipleSelection.isSelectionMode ? (e) => {
                  e.stopPropagation();
                  multipleSelection.toggleItem(p);
                } : undefined}
              >
                <span className={`font-bold ${(p.valor_deve || 0) > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {formatarMoedaDeCentavos(p.valor_deve || 0)}
                </span>
              </td>
              <td 
                className={`p-3 ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                onClick={multipleSelection.isSelectionMode ? (e) => {
                  e.stopPropagation();
                  multipleSelection.toggleItem(p);
                } : undefined}
              >
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
              <td className="p-3">
                {/* No modo de seleção, não mostra botões de ação */}
                {!multipleSelection.isSelectionMode && (
                  <div onClick={(e) => e.stopPropagation()}>
                    {/* Botões de ação aqui se necessário */}
                  </div>
                )}
              </td>
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
    </>
  );
};

export default OrderList;
