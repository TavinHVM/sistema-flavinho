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
      <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-700 text-left text-white uppercase text-xs tracking-wider">
            <th className="p-3">Nome</th>
            <th className="p-3">Email</th>
            <th className="p-3">Cargo</th>
            <th className="p-3">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {filtered.map((user) => (
            <tr
              key={user.id}
              className="even:bg-gray-800 odd:bg-gray-950 hover:bg-gray-700 transition-colors duration-150"
            >
              <td className="p-3 text-gray-100">{user.nome}</td>
              <td className="p-3 font-semibold text-sky-300">{user.email}</td>
              <td className="p-3 text-gray-200">{user.role}</td>
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onExcluir(user.id)}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-all font-medium text-sm"
                  >
                    <FaTrash /> Excluir
                  </button>
                  <button
                    onClick={() => onEditar(user)}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-all font-medium text-sm"
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