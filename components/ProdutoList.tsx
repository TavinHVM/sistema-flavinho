import { FaTrash, FaEdit, FaSortUp, FaSortDown } from "react-icons/fa";
import { formatDateBR } from "../lib/formatDate";
import { useState } from "react";

type Produto = {
  id: string;
  nome: string;
  quantidade_empresa: number;
  quantidade_rua: number;
  last_modified_by: string;
  last_modified_at: string;
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
    let filtered = produtos.filter((produto) =>
      produto.nome.toLowerCase().includes(search.toLowerCase())
    );
    if (!sortKey || !sortOrder) return filtered;
    return [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortKey === "total") {
        aValue = a.quantidade_empresa + a.quantidade_rua;
        bValue = b.quantidade_empresa + b.quantidade_rua;
        return sortOrder === "asc"
          ? aValue - bValue
          : bValue - aValue;
      } else if (sortKey && sortKey in a && sortKey in b) {
        aValue = a[sortKey as keyof Produto];
        bValue = b[sortKey as keyof Produto];
      } else {
        aValue = "";
        bValue = "";
      }

      // Para datas, comparar como datas
      if (sortKey === "last_modified_at") {
        aValue = aValue || "";
        bValue = bValue || "";
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      // Para números
      if (
        sortKey === "quantidade_empresa" ||
        sortKey === "quantidade_rua"
      ) {
        return sortOrder === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }
      // Para strings
      aValue = (aValue || "").toString().toLowerCase();
      bValue = (bValue || "").toString().toLowerCase();
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  })();

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full bg-gray-800 text-white text-sm">
        <thead>
          <tr className="bg-gray-700 text-gray-300">
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
            <th
              className="py-3 px-4 text-left cursor-pointer select-none"
              onClick={() => handleSort("last_modified_at")}
            >
              Última alteração {getSortIcon("last_modified_at")}
            </th>
            <th className="py-3 px-4 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {sortedProdutos.map((produto) => (
            <tr key={produto.id} className="border-b border-gray-700">
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
              <td className="py-4 px-4 font-inter text-[0.9rem] font-normal text-gray-400">
                {produto.last_modified_at ? formatDateBR(produto.last_modified_at) : "-"}
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