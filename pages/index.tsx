import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Produto = {
  id: string;
  nome: string;
  quantidade_empresa: number;
  quantidade_rua: number;
  created_at: string;
};

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState({
    nome: "",
    quantidade_empresa: "",
    quantidade_rua: "",
  });

  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

  // Buscar produtos
  const fetchProdutos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setProdutos(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Adicionar produto
  const adicionarProduto = async () => {
    const quantidadeEmpresa = parseInt(form.quantidade_empresa);
    const quantidadeRua = parseInt(form.quantidade_rua);

    if (!form.nome.trim()) {
      alert("Por favor, preencha o nome do produto.");
      return;
    }

    if (isNaN(quantidadeEmpresa) || isNaN(quantidadeRua)) {
      alert("Por favor, preencha as quantidades corretamente.");
      return;
    }

    const produtoParaSalvar = {
      nome: form.nome,
      quantidade_empresa: quantidadeEmpresa,
      quantidade_rua: quantidadeRua,
    };

    const { error } = await supabase
      .from("produtos")
      .insert([produtoParaSalvar]);

    if (!error) {
      setForm({ nome: "", quantidade_empresa: "", quantidade_rua: "" });
      alert("Produto adicionado com sucesso!");
      fetchProdutos();
    } else {
      console.error("Erro ao adicionar produto:", error);
      alert("Erro ao adicionar produto!");
    }
  };

  const excluirProduto = async (id: string) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("produtos")
      .delete()
      .eq("id", id);
    if (!error) {
      alert("Produto excluído com sucesso!");
      fetchProdutos();
    } else {
      console.error("Erro ao excluir produto:", error);
      alert("Erro ao excluir produto!");
    }
  };

  const editarProduto = async (id: string) => {
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", id)
      .single();

    if (data) {
      setForm({
        nome: data.nome,
        quantidade_empresa: data.quantidade_empresa.toString(),
        quantidade_rua: data.quantidade_rua.toString(),
      });
      setEditando(id);
    }
  };

  const atualizarProduto = async () => {
    if (!editando) return;

    const quantidadeEmpresa = parseInt(form.quantidade_empresa);
    const quantidadeRua = parseInt(form.quantidade_rua);

    if (isNaN(quantidadeEmpresa) || isNaN(quantidadeRua)) {
      alert("Por favor, preencha as quantidades corretamente.");
      return;
    }

    const produtoParaAtualizar = {
      nome: form.nome,
      quantidade_empresa: quantidadeEmpresa,
      quantidade_rua: quantidadeRua,
    };

    const { error } = await supabase
      .from("produtos")
      .update(produtoParaAtualizar)
      .eq("id", editando);

    if (!error) {
      setForm({ nome: "", quantidade_empresa: "", quantidade_rua: "" });
      setEditando(null);
      alert("Produto atualizado com sucesso!");
      fetchProdutos();
    } else {
      console.error("Erro ao atualizar produto:", error);
      alert("Erro ao atualizar produto!");
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Flavinho Festas Espaço & Locações
      </h2>
      <h1 className="text-2xl font-bold mb-4">Controle de Estoque</h1>

      <div className="mb-6 bg-[#1E1E1E] p-4 rounded shadow text-white">
        <h3 className="text-xl font-semibold mb-2">Adicionar produto</h3>
        <h6 className="text-sm mb-2">
          Preencha os campos abaixo para adicionar um novo produto ao estoque.
        </h6>
        <input
          className="border p-2 w-full mb-2 bg-[#1b1b1b] placeholder-[#adadad]"
          placeholder="Nome do produto"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
        <input
          type="number"
          className="border p-2 w-full mb-2 bg-[#1b1b1b] placeholder-[#adadad]"
          placeholder="Quantidade na empresa"
          value={form.quantidade_empresa}
          onChange={(e) =>
            setForm({ ...form, quantidade_empresa: e.target.value })
          }
        />
        <input
          type="number"
          className="border p-2 w-full mb-2 bg-[#1b1b1b] placeholder-[#adadad]"
          placeholder="Quantidade em rota de entrega"
          value={form.quantidade_rua}
          onChange={(e) => setForm({ ...form, quantidade_rua: e.target.value })}
        />
        <button
          onClick={editando ? atualizarProduto : adicionarProduto}
          className={`${
            editando ? "bg-blue-700 hover:bg-blue-800" : "bg-green-700 hover:bg-green-800"
          } text-white px-4 py-2 rounded w-full`}
        >
          {editando ? "Atualizar produto" : "Adicionar produto"}
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold">Estoque</h2>
        <button
          onClick={fetchProdutos}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center"
          disabled={loading}
        >
          <svg
            className={`h-6 w-6 text-white transition-transform ${
              loading ? "animate-spin-reverse" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Arco circular */}
            <path d="M6.75 3v5h5" />
            {/* Arco que cria o círculo */}
            <path d="M19 17a8 8 0 00-11-11" />
          </svg>
        </button>
      </div>

      <ul className="bg-[#1b1b1b] p-4 rounded shadow divide-y">
        {produtos.map((produto) => (
          <li key={produto.id} className="py-2 flex justify-between items-center">
            <div>
              <strong>{produto.nome}</strong> — Na empresa: {produto.quantidade_empresa} | Em rota de entrega: {produto.quantidade_rua}
            </div>
            <div>
              <button
                onClick={() => excluirProduto(produto.id)}
                className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-800 ml-2"
              >
                Excluir
              </button>
              <button
                onClick={() => editarProduto(produto.id)}
                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-800 ml-2"
              >
                Editar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
