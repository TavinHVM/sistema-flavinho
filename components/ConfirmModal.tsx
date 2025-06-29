import React from "react";

interface ConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, onConfirm, onCancel, message }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-xs w-full text-white">
        <div className="mb-4 text-center">{message}</div>
        <div className="flex justify-center gap-4">
          <button className="bg-red-600 px-4 py-2 rounded font-bold" onClick={onConfirm}>Excluir</button>
          <button className="bg-gray-500 px-4 py-2 rounded font-bold" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
