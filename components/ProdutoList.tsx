import { FaSortUp, FaSortDown, FaCheckSquare, FaSquare, FaTrashAlt } from "react-icons/fa";
import { useState } from "react";
import ProdutoDetailsModal from "./ProdutoDetailsModal";
import MultipleSelectionBar from "./MultipleSelectionBar";
import { useMultipleSelection } from "../hooks/useMultipleSelection";
import { formatarMoedaDeCentavos } from "../lib/currencyUtils";

interface Produto {
  numero: number;
  nome: string;
  quantidade_empresa: number;
  quantidade_rua: number;
  preco: number;
  created_at: string;
}

interface ProdutoListProps {
  produtos: Produto[];
  search: string;
  onEditar?: (numero: number) => void;
  onExcluir?: (numero: number) => void;
  onExcluirMultiplos?: (numeros: number[]) => void;
}

type SortKey = keyof Produto | "total" | null;
type SortOrder = "asc" | "desc" | null;

export default function ProdutoList({
  produtos,
  search,
  onEditar,
  onExcluir,
  onExcluirMultiplos,
}: ProdutoListProps) {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [modalProduto, setModalProduto] = useState<Produto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Hook para seleção múltipla
  const multipleSelection = useMultipleSelection({
    items: produtos,
    getItemId: (produto) => produto.numero,
  });

  const handleDeleteSelected = () => {
    if (onExcluirMultiplos && multipleSelection.hasSelections) {
      const selectedNumbers = multipleSelection.getSelectedItemsData().map(produto => produto.numero);
      onExcluirMultiplos(selectedNumbers);
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

  const handleVerMais = (produto: Produto) => {
    setModalProduto(produto);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalProduto(null);
  };

  const sortedProdutos = (() => {
    const filtered = produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(search.toLowerCase())
    );
    if (!sortKey || !sortOrder) return filtered;
    return [...filtered].sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      // Ordenação numérica para total
      if (sortKey === "total") {
        const aTotal = Number(a.quantidade_empresa) + Number(a.quantidade_rua);
        const bTotal = Number(b.quantidade_empresa) + Number(b.quantidade_rua);
        return sortOrder === "asc"
          ? aTotal - bTotal
          : bTotal - aTotal;
      }

      if (sortKey && sortKey in a && sortKey in b) {
        aValue = a[sortKey as keyof Produto];
        bValue = b[sortKey as keyof Produto];
      } else {
        aValue = "";
        bValue = "";
      }

      // Ordenação numérica para numero, quantidade_empresa, quantidade_rua
      if (
        sortKey === "numero" ||
        sortKey === "quantidade_empresa" ||
        sortKey === "quantidade_rua" ||
        sortKey === "preco" // <- aqui!
      ) {
        const aNum = typeof aValue === "number" ? aValue : Number(aValue) || 0;
        const bNum = typeof bValue === "number" ? bValue : Number(bValue) || 0;
        return sortOrder === "asc"
          ? aNum - bNum
          : bNum - aNum;
      }


      // Para strings
      const aStr = (aValue ?? "").toString().toLowerCase();
      const bStr = (bValue ?? "").toString().toLowerCase();
      return sortOrder === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  })();

  function formatarMoeda(valor: number) {
    return formatarMoedaDeCentavos(valor);
  }

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
        itemName="produtos"
      />
      
      <div className="overflow-x-auto rounded-lg" style={{ marginTop: multipleSelection.isSelectionMode ? '60px' : '0' }}>
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

        <div className="max-h-[600px] overflow-y-auto bg-gray-900 rounded-lg">
          <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
            <thead className="sticky top-0 z-10">
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
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("numero")}>
                  N° {getSortIcon("numero")}
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("nome")}>
                  Nome {getSortIcon("nome")}
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("preco")}>
                  Preço {getSortIcon("preco")}
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("quantidade_empresa")}>
                  Na empresa {getSortIcon("quantidade_empresa")}
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("quantidade_rua")}>
                  Em rota de entrega {getSortIcon("quantidade_rua")}
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("total")}>
                  Total {getSortIcon("total")}
                </th>
              </tr>
            </thead>
          <tbody className="divide-y divide-gray-800">
            {sortedProdutos.map((produto) => (
              <tr
                key={produto.numero}
                className={`hover:bg-gray-800 cursor-pointer transition-colors duration-150 even:bg-gray-900 odd:bg-gray-950 ${
                  multipleSelection.isSelectionMode && multipleSelection.isSelected(produto) 
                    ? 'bg-blue-900/30 border-l-4 border-blue-500' 
                    : ''
                }`}
                onClick={!multipleSelection.isSelectionMode ? (e) => {
                  if ((e.target as HTMLElement).closest("button")) return;
                  handleVerMais(produto);
                } : undefined}
              >
                {multipleSelection.isSelectionMode && (
                  <td className="p-3 w-12">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        multipleSelection.toggleItem(produto);
                      }}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      {multipleSelection.isSelected(produto) ? (
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
                    multipleSelection.toggleItem(produto);
                  } : undefined}
                >
                  {produto.numero}
                </td>
                <td 
                  className={`p-3 text-gray-100 font-semibold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                  onClick={multipleSelection.isSelectionMode ? (e) => {
                    e.stopPropagation();
                    multipleSelection.toggleItem(produto);
                  } : undefined}
                >
                  {produto.nome}
                </td>
                <td 
                  className={`p-3 ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                  onClick={multipleSelection.isSelectionMode ? (e) => {
                    e.stopPropagation();
                    multipleSelection.toggleItem(produto);
                  } : undefined}
                >
                  <span className="text-slate-400 font-bold"></span>
                  <span className="text-emerald-400 font-bold">{formatarMoeda(produto.preco)}</span>
                </td>
                <td 
                  className={`p-3 text-blue-400 font-bold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                  onClick={multipleSelection.isSelectionMode ? (e) => {
                    e.stopPropagation();
                    multipleSelection.toggleItem(produto);
                  } : undefined}
                >
                  {produto.quantidade_empresa}
                </td>
                <td 
                  className={`p-3 text-yellow-400 font-bold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                  onClick={multipleSelection.isSelectionMode ? (e) => {
                    e.stopPropagation();
                    multipleSelection.toggleItem(produto);
                  } : undefined}
                >
                  {produto.quantidade_rua}
                </td>
                <td 
                  className={`p-3 text-gray-200 font-bold ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                  onClick={multipleSelection.isSelectionMode ? (e) => {
                    e.stopPropagation();
                    multipleSelection.toggleItem(produto);
                  } : undefined}
                >
                  {produto.quantidade_empresa + produto.quantidade_rua}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        <ProdutoDetailsModal produto={modalProduto} open={modalOpen} onClose={handleCloseModal} onEditar={onEditar} onExcluir={onExcluir} />
      </div>
    </>
  );
}