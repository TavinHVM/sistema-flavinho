import React from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';

interface ConfirmMultipleDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemCount: number;
  itemName: string; // Ex: "produtos", "pedidos", "usuários", "conjuntos"
  loading?: boolean;
}

const ConfirmMultipleDeleteModal: React.FC<ConfirmMultipleDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemCount,
  itemName,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-600">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaTrash className="text-red-400" />
            Confirmar Exclusão Múltipla
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-red-400 text-2xl">⚠️</div>
              <div>
                <h3 className="text-red-400 font-semibold mb-2">Atenção!</h3>
                <p className="text-gray-300 text-sm">
                  Você está prestes a excluir <strong className="text-white">{itemCount}</strong> {itemName}.
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  Esta ação <strong className="text-red-400">não pode ser desfeita</strong>. 
                  Todos os dados selecionados serão permanentemente removidos.
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm">
            Tem certeza que deseja continuar?
          </p>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white rounded transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-700 text-white rounded flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Excluindo...
              </>
            ) : (
              <>
                <FaTrash />
                Excluir {itemCount} {itemName}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmMultipleDeleteModal;
