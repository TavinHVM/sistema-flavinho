import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

interface Produto {
  numero: number;
  nome: string;
  quantidade_empresa: number;
  quantidade_rua: number;
  created_at: string;
}

interface ProdutoDetailsModalProps {
  produto: Produto | null;
  open: boolean;
  onClose: () => void;
  onEditar?: (numero: number) => void;
  onExcluir?: (numero: number) => void;
}

const ProdutoDetailsModal: React.FC<ProdutoDetailsModalProps> = ({ produto, open, onClose, onEditar, onExcluir }) => {
  if (!produto) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 ${open ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixo */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800">
          <h2 className="text-xl md:text-2xl font-bold text-white">Detalhes do Produto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-3xl transition-colors duration-200">&times;</button>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-2 p-6 border-b border-gray-700 bg-gray-800">
          {onEditar && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 text-sm flex items-center gap-2 transition-colors duration-200"
              onClick={() => { onClose(); onEditar(produto.numero); }}
            >
              <FaEdit /> Editar
            </button>
          )}
          {onExcluir && (
            <button
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-3 text-sm flex items-center gap-2 transition-colors duration-200"
              onClick={() => { onClose(); onExcluir(produto.numero); }}
            >
              <FaTrash /> Excluir
            </button>
          )}
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Informações básicas do produto */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📦 Informações do Produto
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Número</span>
                <p className="text-white font-bold text-2xl">{produto.numero}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Nome</span>
                <p className="text-white font-semibold text-lg">{produto.nome}</p>
              </div>
            </div>
          </div>

          {/* Quantidades */}
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📊 Quantidades
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                <span className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Na Empresa</span>
                <p className="text-blue-400 font-bold text-2xl">{produto.quantidade_empresa}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                <span className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Em Rota</span>
                <p className="text-yellow-400 font-bold text-2xl">{produto.quantidade_rua}</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                <span className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Total</span>
                <p className="text-green-400 font-bold text-2xl">{produto.quantidade_empresa + produto.quantidade_rua}</p>
              </div>
            </div>
          </div>

          {/* Informações de criação */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              🕒 Informações de Criação
            </h3>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <span className="text-gray-400 text-xs uppercase tracking-wide">Criado em</span>
              <p className="text-white font-semibold text-lg">
                {new Date(produto.created_at).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProdutoDetailsModal;
