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
    <ul className="bg-gray-800 p-6 rounded-lg shadow-md">
      {produtos
        .filter((produto) =>
          produto.nome.toLowerCase().includes(search.toLowerCase())
        )
        .map((produto, idx, arr) => (
          <li
            key={produto.id}
            className={`py-4 flex justify-between items-center${
              idx !== arr.length - 1 ? " border-b border-gray-700" : ""
            }`}
          >
            <div>
              <strong className="font-poppins text-[1.1rem] font-semibold">
                {produto.nome}
              </strong>
              <p className="font-inter text-[0.9rem] font-normal text-gray-400">
                Na empresa:{" "}
                <strong className="text-gray-300">
                  {produto.quantidade_empresa}
                </strong>{" "}
                | Em rota de entrega:{" "}
                <strong className="text-gray-300">
                  {produto.quantidade_rua}
                </strong>{" "}
                | Total:{" "}
                <strong className="text-gray-300">
                  {produto.quantidade_empresa + produto.quantidade_rua}
                </strong>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Última alteração por:{" "}
                <strong className="text-gray-300 text-sm">
                  {produto.last_modified_by || "N/A"}
                </strong>
              </p>
            </div>
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
          </li>
        ))}
    </ul>
  );
}