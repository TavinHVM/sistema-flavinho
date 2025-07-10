import { FaSortUp, FaSortDown } from "react-icons/fa";
import { useState } from "react";
import ProdutoDetailsModal from "./ProdutoDetailsModal";

interface Produto {
  numero: number;
  nome: string;
  quantidade_empresa: number;
  quantidade_rua: number;
  created_at: string;
}

interface ProdutoListProps {
  produtos: Produto[];
  search: string;
  onEditar?: (numero: number) => void;
  onExcluir?: (numero: number) => void;
}

type SortKey = keyof Produto | "total" | null;
type SortOrder = "asc" | "desc" | null;

export default function ProdutoList({
  produtos,
  search,
  onEditar,
  onExcluir,
}: ProdutoListProps) {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [modalProduto, setModalProduto] = useState<Produto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
        sortKey === "quantidade_rua"
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

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-left text-white uppercase text-xs tracking-wider">
            <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("numero")}>
              N° {getSortIcon("numero")}
            </th>
            <th className="p-3 cursor-pointer select-none" onClick={() => handleSort("nome")}>
              Nome {getSortIcon("nome")}
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
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {sortedProdutos.map((produto) => (
            <tr
              key={produto.numero}
              className="hover:bg-gray-800 transition-colors duration-150 cursor-pointer even:bg-gray-900 odd:bg-gray-950"
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button")) return;
                handleVerMais(produto);
              }}
            >
              <td className="p-3 text-gray-400">{produto.numero}</td>
              <td className="p-3 text-gray-100 font-semibold">{produto.nome}</td>
              <td className="p-3 text-gray-400">{produto.quantidade_empresa}</td>
              <td className="p-3 text-gray-400">{produto.quantidade_rua}</td>
              <td className="p-3 text-gray-400">
                {produto.quantidade_empresa + produto.quantidade_rua}
              </td>
              <td className="p-3"></td>
            </tr>
          ))}
        </tbody>
      </table>
      <ProdutoDetailsModal produto={modalProduto} open={modalOpen} onClose={handleCloseModal} onEditar={onEditar} onExcluir={onExcluir} />
    </div>
  );
}