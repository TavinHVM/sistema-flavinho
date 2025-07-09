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
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${open ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Detalhes do Produto</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-2xl">&times;</button>
        </div>
        <div className="flex gap-2 mb-4">
          {onEditar && (
            <button
              className="bg-blue-600 text-white rounded px-2 py-1 text-xs flex items-center gap-1"
              onClick={() => { onClose(); onEditar(produto.numero); }}
            >
              <FaEdit /> Editar
            </button>
          )}
          {onExcluir && (
            <button
              className="bg-red-600 text-white rounded px-2 py-1 text-xs flex items-center gap-1"
              onClick={() => { onClose(); onExcluir(produto.numero); }}
            >
              <FaTrash /> Excluir
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm text-white">
          <div><b>Nº:</b> {produto.numero}</div>
          <div><b>Nome:</b> {produto.nome}</div>
          <div><b>Na empresa:</b> {produto.quantidade_empresa}</div>
          <div><b>Em rota de entrega:</b> {produto.quantidade_rua}</div>
          <div><b>Total:</b> {produto.quantidade_empresa + produto.quantidade_rua}</div>
          <div>
            <b>Criado em:</b> {new Date(produto.created_at).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutoDetailsModal;
