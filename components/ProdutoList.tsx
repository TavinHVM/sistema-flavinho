import { FaTrash, FaEdit } from "react-icons/fa";

type Produto = {
  id: string;
  nome: string;
  quantidade_empresa: number;
  quantidade_rua: number;
  last_modified_by: string;
};

interface ProdutoListProps {
  produtos: Produto[];
  search: string;
  onEditar: (id: string) => void;
  onExcluir: (id: string) => void;
}

export default function ProdutoList({
  produtos,
  search,
  onEditar,
  onExcluir,
}: ProdutoListProps) {
  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="min-w-full bg-gray-800 text-white text-sm">
        <thead>
          <tr className="bg-gray-700 text-gray-300">
            <th className="py-3 px-4 text-left">Nome</th>
            <th className="py-3 px-4 text-left">Na empresa</th>
            <th className="py-3 px-4 text-left">Em rota de entrega</th>
            <th className="py-3 px-4 text-left">Total</th>
            <th className="py-3 px-4 text-left">Última alteração</th>
            <th className="py-3 px-4 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos
            .filter((produto) =>
              produto.nome.toLowerCase().includes(search.toLowerCase())
            )
            .map((produto) => (
              <tr key={produto.id} className="border-b border-gray-700">
                <td className="py-4 px-4 font-poppins text-[1rem] font-semibold">
                  {produto.nome}
                </td>
                <td className="py-4 px-4 font-inter text-[0.9rem] font-normal text-gray-400">
                  {produto.quantidade_empresa}
                </td>
                <td className="py-4 px-4 font-inter text-[0.9rem] font-normal text-gray-400">
                  {produto.quantidade_rua}
                </td>
                <td className="py-4 px-4 font-inter text-[0.9rem] font-normal text-gray-400">
                  {produto.quantidade_empresa + produto.quantidade_rua}
                </td>
                <td className="py-4 px-4 font-inter text-[0.9rem] font-normal text-gray-400">
                  {produto.last_modified_by || "N/A"}
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onExcluir(produto.id)}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-all font-poppins text-[0.95rem] font-medium"
                    >
                      <FaTrash /> Excluir
                    </button>
                    <button
                      onClick={() => onEditar(produto.id)}
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