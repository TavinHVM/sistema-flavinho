import React, { useState } from "react";
import { FaEdit, FaTrash, FaEye, FaSortUp, FaSortDown } from "react-icons/fa";
import { ConjuntoCompleto } from "../types/Conjunto";

interface ConjuntoListProps {
  conjuntos: ConjuntoCompleto[];
  search: string;
  onEditar?: (conjunto: ConjuntoCompleto) => void;
  onExcluir?: (id: number) => void;
  onToggleAtivo?: (id: number, ativo: boolean) => void;
}

type SortKey = "numero" | "nome" | "preco_promocional" | "preco_total_individual" | "economia" | null;
type SortOrder = "asc" | "desc" | null;

const ConjuntoList: React.FC<ConjuntoListProps> = ({
  conjuntos,
  search,
  onEditar,
  onExcluir,
  onToggleAtivo,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [expandedConjunto, setExpandedConjunto] = useState<number | null>(null);

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

  const formatarMoeda = (centavos: number) => {
    return (centavos / 100).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    });
  };

  // Filtrar conjuntos baseado na busca
  const conjuntosFiltrados = conjuntos.filter(conjunto => {
    if (!search) return true;
    
    const searchLower = search.toLowerCase();
    return (
      conjunto.nome.toLowerCase().includes(searchLower) ||
      (conjunto.numero?.toString() || '').includes(search) ||
      (conjunto.descricao || '').toLowerCase().includes(searchLower) ||
      conjunto.itens.some(item => item.produto_nome.toLowerCase().includes(searchLower))
    );
  });

  const conjuntosOrdenados = (() => {
    if (!sortKey || !sortOrder) return conjuntosFiltrados;
    
    return [...conjuntosFiltrados].sort((a, b) => {
      const aValue: unknown = a[sortKey as keyof typeof a];
      const bValue: unknown = b[sortKey as keyof typeof b];

      // Para campos numéricos
      if (["numero", "preco_promocional", "preco_total_individual", "economia"].includes(sortKey)) {
        const aNum = typeof aValue === "number" ? aValue : Number(aValue) || 0;
        const bNum = typeof bValue === "number" ? bValue : Number(bValue) || 0;
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
      }

      // Para strings
      const aStr = (aValue ?? "").toString().toLowerCase();
      const bStr = (bValue ?? "").toString().toLowerCase();
      return sortOrder === "asc" 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  })();

  const toggleExpanded = (conjuntoId: number) => {
    setExpandedConjunto(expandedConjunto === conjuntoId ? null : conjuntoId);
  };

  if (conjuntos.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800 rounded-lg">
        <div className="text-gray-400 text-lg mb-2">🎁</div>
        <div className="text-gray-400">Nenhum conjunto criado ainda</div>
        <div className="text-gray-500 text-sm">Crie seu primeiro conjunto de produtos com desconto!</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-700 text-gray-200">
            <tr>
              <th className="p-3 text-left cursor-pointer select-none" onClick={() => handleSort("numero")}>
                <span className="flex items-center">
                  N° {getSortIcon("numero")}
                </span>
              </th>
              <th className="p-3 text-left cursor-pointer select-none" onClick={() => handleSort("nome")}>
                <span className="flex items-center">
                  Nome {getSortIcon("nome")}
                </span>
              </th>
              <th className="p-3 text-center">Itens</th>
              <th className="p-3 text-center cursor-pointer select-none" onClick={() => handleSort("preco_total_individual")}>
                <span className="flex items-center justify-center">
                  Preço Individual {getSortIcon("preco_total_individual")}
                </span>
              </th>
              <th className="p-3 text-center cursor-pointer select-none" onClick={() => handleSort("preco_promocional")}>
                <span className="flex items-center justify-center">
                  Preço Promocional {getSortIcon("preco_promocional")}
                </span>
              </th>
              <th className="p-3 text-center cursor-pointer select-none" onClick={() => handleSort("economia")}>
                <span className="flex items-center justify-center">
                  Economia {getSortIcon("economia")}
                </span>
              </th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {conjuntosOrdenados.map((conjunto) => (
              <React.Fragment key={conjunto.id}>
                <tr className={`hover:bg-gray-700 transition-colors ${!conjunto.ativo ? 'opacity-50' : ''}`}>
                  <td className="p-3 text-gray-400 font-mono">{conjunto.numero}</td>
                  <td className="p-3">
                    <div className="text-white font-semibold">{conjunto.nome}</div>
                    {conjunto.descricao && (
                      <div className="text-gray-400 text-xs mt-1 truncate max-w-xs">
                        {conjunto.descricao}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleExpanded(conjunto.id!)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1 mx-auto transition-colors"
                    >
                      <FaEye className="text-xs" />
                      {conjunto.itens.length} {conjunto.itens.length === 1 ? 'item' : 'itens'}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-red-400 font-bold">
                      {formatarMoeda(conjunto.preco_total_individual || 0)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-green-400 font-bold">
                      {formatarMoeda(conjunto.preco_promocional)}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="text-blue-400 font-bold">
                      {formatarMoeda(conjunto.economia || 0)}
                    </div>
                    {conjunto.preco_total_individual && conjunto.preco_total_individual > 0 && conjunto.economia && conjunto.economia > 0 ? (
                      <div className="text-blue-300 text-xs">
                        ({(((conjunto.economia) / conjunto.preco_total_individual) * 100).toFixed(1)}% off)
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs">-</div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => onToggleAtivo?.(conjunto.id!, !conjunto.ativo)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        conjunto.ativo
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {conjunto.ativo ? '✅ Ativo' : '❌ Inativo'}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {onEditar && (
                        <button
                          onClick={() => onEditar(conjunto)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
                          title="Editar conjunto"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                      )}
                      {onExcluir && (
                        <button
                          onClick={() => onExcluir(conjunto.id!)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                          title="Excluir conjunto"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
                
                {/* Linha expandida com detalhes dos itens */}
                {expandedConjunto === conjunto.id && (
                  <tr>
                    <td colSpan={8} className="p-0">
                      <div className="bg-gray-750 border-t border-gray-600">
                        <div className="p-4">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            📋 Itens do Conjunto
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {conjunto.itens.map((item, index) => (
                              <div key={index} className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                                <div className="text-white font-medium">{item.produto_nome}</div>
                                <div className="text-gray-400 text-sm">
                                  Quantidade: <span className="text-blue-400 font-semibold">{item.quantidade}</span>
                                </div>
                                {conjunto.itens_detalhados && conjunto.itens_detalhados[index] && (
                                  <div className="text-gray-400 text-xs mt-1">
                                    Valor: {formatarMoeda(conjunto.itens_detalhados[index].preco_total_individual || 0)}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConjuntoList;
