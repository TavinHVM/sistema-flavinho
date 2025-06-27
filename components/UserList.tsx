import { FaTrash, FaEdit } from "react-icons/fa";

interface User {
  id: string;
  nome: string;
  email: string;
  role: string;
}

interface UserListProps {
  users: User[];
  search: string;
  onEditar: (user: User) => void;
  onExcluir: (id: string) => void;
}

export default function UserList({ users, search, onEditar, onExcluir }: UserListProps) {
  const filtered = users.filter((user) =>
    typeof user.nome === "string" &&
    user.nome &&
    user.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 rounded-lg">
        <thead>
          <tr>
            <th className="py-3 px-4 text-left">Nome</th>
            <th className="py-3 px-4 text-left">Email</th>
            <th className="py-3 px-4 text-left">Cargo</th>
            <th className="py-3 px-4 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((user) => (
            <tr key={user.id} className="border-b border-gray-700">
              <td className="py-4 px-4">{user.nome}</td>
              <td className="py-4 px-4">{user.email}</td>
              <td className="py-4 px-4">{user.role}</td>
              <td className="py-4 px-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onExcluir(user.id)}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-all font-poppins text-[0.95rem] font-medium"
                  >
                    <FaTrash /> Excluir
                  </button>
                  <button
                    onClick={() => onEditar(user)}
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