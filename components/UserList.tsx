import { FaTrash, FaEdit, FaCheckSquare, FaSquare, FaTrashAlt } from "react-icons/fa";
import MultipleSelectionBar from "./MultipleSelectionBar";
import { useMultipleSelection } from "../hooks/useMultipleSelection";

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
  onExcluirMultiplos?: (ids: string[]) => void;
}

export default function UserList({ users, search, onEditar, onExcluir, onExcluirMultiplos }: UserListProps) {
  // Hook para seleção múltipla
  const multipleSelection = useMultipleSelection({
    items: users,
    getItemId: (user) => user.id,
  });

  const handleDeleteSelected = () => {
    if (onExcluirMultiplos && multipleSelection.hasSelections) {
      const selectedIds = multipleSelection.getSelectedItemsData().map(user => user.id);
      onExcluirMultiplos(selectedIds);
      multipleSelection.exitSelectionMode();
    }
  };

  const filtered = users.filter((user) =>
    typeof user.nome === "string" &&
    user.nome &&
    user.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <MultipleSelectionBar
        isVisible={multipleSelection.isSelectionMode}
        selectedCount={multipleSelection.selectedCount}
        isAllSelected={multipleSelection.isAllSelected}
        isPartiallySelected={multipleSelection.isPartiallySelected}
        onToggleAll={multipleSelection.toggleAll}
        onDeleteSelected={handleDeleteSelected}
        onCancel={multipleSelection.exitSelectionMode}
        itemName="usuários"
      />
      
      <div className="overflow-x-auto" style={{ marginTop: multipleSelection.isSelectionMode ? '60px' : '0' }}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            {!multipleSelection.isSelectionMode && onExcluirMultiplos && (
              <button
                onClick={multipleSelection.enterSelectionMode}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded flex items-center gap-2 transition-colors text-sm"
                title="Ativar modo de seleção múltipla"
              >
                <FaTrashAlt />
                Seleção Múltipla
              </button>
            )}
          </div>
        </div>

        <table className="w-full text-sm bg-gray-900 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-700 text-left text-white uppercase text-xs tracking-wider">
              {multipleSelection.isSelectionMode && (
                <th className="p-3 w-12">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      multipleSelection.toggleAll();
                    }}
                    className="text-white hover:text-gray-300 transition-colors"
                    title={multipleSelection.isAllSelected ? "Desmarcar todos" : "Selecionar todos"}
                  >
                    {multipleSelection.isAllSelected ? (
                      <FaCheckSquare className="text-lg" />
                    ) : multipleSelection.isPartiallySelected ? (
                      <FaCheckSquare className="text-lg opacity-50" />
                    ) : (
                      <FaSquare className="text-lg" />
                    )}
                  </button>
                </th>
              )}
              <th className="p-3">Nome</th>
              <th className="p-3">Email</th>
              <th className="p-3">Cargo</th>
              {!multipleSelection.isSelectionMode && <th className="p-3">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((user) => (
              <tr
                key={user.id}
                className={`even:bg-gray-800 odd:bg-gray-950 hover:bg-gray-700 transition-colors duration-150 ${
                  multipleSelection.isSelectionMode && multipleSelection.isSelected(user) 
                    ? 'bg-blue-900/30 border-l-4 border-blue-500' 
                    : ''
                }`}
              >
                {multipleSelection.isSelectionMode && (
                  <td className="p-3 w-12">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        multipleSelection.toggleItem(user);
                      }}
                      className="text-white hover:text-blue-400 transition-colors"
                    >
                      {multipleSelection.isSelected(user) ? (
                        <FaCheckSquare className="text-lg text-blue-400" />
                      ) : (
                        <FaSquare className="text-lg" />
                      )}
                    </button>
                  </td>
                )}
                <td 
                  className={`p-3 text-gray-100 ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                  onClick={multipleSelection.isSelectionMode ? (e) => {
                    e.stopPropagation();
                    multipleSelection.toggleItem(user);
                  } : undefined}
                >
                  {user.nome}
                </td>
                <td 
                  className={`p-3 font-semibold text-sky-300 ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                  onClick={multipleSelection.isSelectionMode ? (e) => {
                    e.stopPropagation();
                    multipleSelection.toggleItem(user);
                  } : undefined}
                >
                  {user.email}
                </td>
                <td
                  className={`p-3 ${user.role === 'Administrador'
                      ? 'text-amber-400'
                      : user.role === 'Funcionario'
                        ? 'text-emerald-400'
                        : 'text-emerald-400'
                    } ${multipleSelection.isSelectionMode ? 'cursor-pointer' : ''}`}
                  onClick={multipleSelection.isSelectionMode ? (e) => {
                    e.stopPropagation();
                    multipleSelection.toggleItem(user);
                  } : undefined}
                >
                  {user.role}
                </td>

                {!multipleSelection.isSelectionMode && (
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
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}