import React from 'react';
import { FaTrash, FaTimes, FaCheckSquare, FaSquare } from 'react-icons/fa';

interface MultipleSelectionBarProps {
  isVisible: boolean;
  selectedCount: number;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
  onToggleAll: () => void;
  onDeleteSelected: () => void;
  onCancel: () => void;
  itemName: string; // Ex: "produtos", "pedidos", "usuários", "conjuntos"
}

const MultipleSelectionBar: React.FC<MultipleSelectionBarProps> = ({
  isVisible,
  selectedCount,
  isAllSelected,
  isPartiallySelected,
  onToggleAll,
  onDeleteSelected,
  onCancel,
  itemName,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleAll}
              className="flex items-center gap-2 text-sm hover:bg-red-500/20 px-2 py-1 rounded transition-colors"
              title={isAllSelected ? `Desmarcar todos os ${itemName}` : `Selecionar todos os ${itemName}`}
            >
              {isAllSelected ? (
                <FaCheckSquare className="text-lg" />
              ) : isPartiallySelected ? (
                <FaCheckSquare className="text-lg opacity-50" />
              ) : (
                <FaSquare className="text-lg" />
              )}
              <span>
                {isAllSelected ? 'Desmarcar todos' : 'Selecionar todos'}
              </span>
            </button>
            
            <div className="text-sm font-medium">
              {selectedCount} {itemName} selecionado{selectedCount !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onDeleteSelected}
              disabled={selectedCount === 0}
              className="bg-red-800 hover:bg-red-900 disabled:bg-red-800/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
              title={`Excluir ${selectedCount} ${itemName} selecionado${selectedCount !== 1 ? 's' : ''}`}
            >
              <FaTrash />
              Excluir Selecionados ({selectedCount})
            </button>
            
            <button
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors"
              title="Cancelar seleção"
            >
              <FaTimes />
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultipleSelectionBar;
