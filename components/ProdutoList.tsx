import { FaTrash, FaEdit, FaSortUp, FaSortDown } from "react-icons/fa";
import { formatDateBR } from "../lib/formatDate";
import { useState } from "react";

type Produto = {
  id: string;
  nome: string;
  quantidade_empresa: number;
  quantidade_rua: number;
  numero: number;
};

interface ProdutoListProps {
  produtos: Produto[];
  search: string;
  onEditar: (id: string) => void;
  onExcluir: (id: string) => void;
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

  const sortedProdutos = (() => {
    const filtered = produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(search.toLowerCase())
    );
    if (!sortKey || !sortOrder) return filtered;
    return [...filtered].sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      if (sortKey === "total") {
        aValue = a.quantidade_empresa + a.quantidade_rua;
        bValue = b.quantidade_empresa + b.quantidade_rua;
        return sortOrder === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      } else if (sortKey && sortKey in a && sortKey in b) {
        aValue = a[sortKey as keyof Produto];
        bValue = b[sortKey as keyof Produto];
      } else {
        aValue = "";
        bValue = "";
      }

      // Ordenação numérica para numero
      if (sortKey === "numero") {
        const aNum = typeof aValue === "number" ? aValue : Number(aValue) || 0;
        const bNum = typeof bValue === "number" ? bValue : Number(bValue) || 0;
        return sortOrder === "asc"
          ? aNum - bNum
          : bNum - aNum;
      }

      // Para números
      if (
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
      <table className="min-w-full bg-gray-800 text-white text-sm">
        <thead>
          <tr className="bg-gray-700 text-gray-300">
            <th
              className="py-3 px-4 text-left cursor-pointer select-none"
              onClick={() => handleSort("numero")}>
              N° {getSortIcon("numero")}
            </th>
            <th
              className="py-3 px-4 text-left cursor-pointer select-none"
              onClick={() => handleSort("nome")}
            >
              Nome {getSortIcon("nome")}
            </th>
            <th
              className="py-3 px-4 text-left cursor-pointer select-none"
              onClick={() => handleSort("quantidade_empresa")}
            >
              Na empresa {getSortIcon("quantidade_empresa")}
            </th>
            <th
              className="py-3 px-4 text-left cursor-pointer select-none"
              onClick={() => handleSort("quantidade_rua")}
            >
              Em rota de entrega {getSortIcon("quantidade_rua")}
            </th>
            <th
              className="py-3 px-4 text-left cursor-pointer select-none"
              onClick={() => handleSort("total")}
            >
              Total {getSortIcon("total")}
            </th>
            <th className="py-3 px-4 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {sortedProdutos.map((produto) => (
            <tr key={produto.id} className="border-b border-gray-700">
              <td className="py-4 px-4 font-inter text-[0.9rem] font-normal text-gray-400">
                {produto.numero}
              </td>
              <td className="py-4 px-4 font-poppins text-[1rem] font-semibold">
                {produto.nome}
              </td>
              <td className="py-4 px-4 font-inter text-[0.9rem] font-normal text-gray-400">
                {produto.quantidade_empresa}
              </td>
              <td className="py-4 px-4 font-inter text-[0.9rem] font-normal text-gray-400">
                {produto.quantidade_rua}
              </td>
              <td className="py-4 px-4 font-inter text-[0.9rem] font-normal text-gray-400">
                {produto.quantidade_empresa + produto.quantidade_rua}
              </td>
              <td className="py-4 px-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onExcluir(produto.id)}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-all font-poppins text-[0.95rem] font-medium"
                  >
                    <FaTrash /> Excluir
                  </button>
                  <button
                    onClick={() => onEditar(produto.id)}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-all font-poppins text-[0.95rem] font-medium"
                  >
                    <FaEdit /> Editar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}