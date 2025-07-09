import React from "react";

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
}

interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, open, onClose }) => {
  if (!user) return null;

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
          <h2 className="text-xl font-bold text-white">Detalhes do Usuário</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-2xl">&times;</button>
        </div>
        <div className="grid grid-cols-1 gap-2 text-sm text-white">
          <div><b>Nome:</b> {user.nome}</div>
          <div><b>Email:</b> {user.email}</div>
          <div><b>Cargo:</b> {user.role}</div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
