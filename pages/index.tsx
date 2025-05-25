import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import {
  FaTrash,
  FaEdit,
  FaPlus,
  FaSyncAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [userEmail, setUserEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const router = useRouter();

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
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace("/login");
      } else {
        fetchProdutos();
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        setIsAdmin(user.user_metadata?.role === "admin");
      }
    };

    fetchUser();
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
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este produto?"
    );
    if (!confirmar) return;

    const { error } = await supabase.from("produtos").delete().eq("id", id);
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

  // Função para obter data/hora formatada
  function getDataHoraFormatada() {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, "0");
    const min = String(agora.getMinutes()).padStart(2, "0");
    return `${dia}-${mes}-${ano} ${hora}h${min}`;
  }

  // Função para exportar CSV
  const exportarCSV = () => {
    const dataHora = getDataHoraFormatada();
    const header = ["Nome", "Qtde. Empresa", "Qtde. Entrega", "Total"];
    const rows = produtos.map((p) => [
      p.nome,
      p.quantidade_empresa,
      p.quantidade_rua,
      p.quantidade_empresa + p.quantidade_rua,
    ]);
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Estoque - Flavinho Festas;Gerado em: ${dataHora}\n`;
    csvContent += header.join(";") + "\n";
    rows.forEach((rowArray) => {
      csvContent += rowArray.join(";") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Estoque - Flavinho Festas ${dataHora}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função para exportar PDF
  const exportarPDF = () => {
    const dataHora = getDataHoraFormatada();
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Estoque - Flavinho Festas", 14, 14);
    doc.setFontSize(10);
    const pageWidth = doc.internal.pageSize.getWidth();
    const text = `Gerado em: ${dataHora}`;
    const textWidth = doc.getTextWidth(text);
    doc.text(text, pageWidth - textWidth - 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Nome", "Qtde. Empresa", "Qtde. Entrega", "Total"]],
      body: produtos.map((p) => [
        p.nome,
        p.quantidade_empresa,
        p.quantidade_rua,
        p.quantidade_empresa + p.quantidade_rua,
      ]),
    });
    doc.save(`Estoque - Flavinho Festas ${dataHora}.pdf`);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.replace("/login");
    } else {
      console.error("Erro ao sair:", error);
      alert("Erro ao sair!");
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto bg-gray-900 text-white rounded-lg shadow-lg mt-8 mb-8">
      <header className="mb-8">
        <div className="w-full flex items-center justify-between relative">
          <div className="flex-1 flex justify-start">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-poppins font-medium px-2 py-2 rounded transition-all ml-0"
            >
              <FaSignOutAlt />
              Logout
            </a>
          </div>

          <div className="flex flex-col items-center justify-center">
            <h1 className="font-poppins text-[2rem] font-bold mb-1 text-center">
              Flavinho Festas
            </h1>
            <p className="font-inter text-[1rem] font-normal text-gray-400 text-center mt-0">
              Gerencie seu estoque de forma eficiente e prática
            </p>
          </div>

          <div className="flex-1 flex justify-end">
            <img
              src="/favicon.ico"
              alt="Favicon"
              className="w-28 h-28 ml-0 mr-0"
            />
          </div>
        </div>
      </header>

      <section className="mb-4 bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="font-poppins text-[1.1rem] font-semibold mb-4">
          {editando ? "Atualizar Produto" : "Adicionar Produto"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-xs text-gray-300 font-poppins">
              Nome
            </label>
            <input
              className="font-poppins border p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do produto"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-xs text-gray-300 font-poppins">
              Qtde. Empresa
            </label>
            <input
              type="number"
              className="font-inter border p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Quantidade na empresa"
              value={form.quantidade_empresa}
              onChange={(e) =>
                setForm({ ...form, quantidade_empresa: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-xs text-gray-300 font-poppins">
              Qtde. Entrega
            </label>
            <input
              type="number"
              className="font-inter border p-3 rounded bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Quantidade em rota de entrega"
              value={form.quantidade_rua}
              onChange={(e) =>
                setForm({ ...form, quantidade_rua: e.target.value })
              }
            />
          </div>
        </div>
        <button
          onClick={editando ? atualizarProduto : adicionarProduto}
          className={`mt-4 w-full flex items-center justify-center gap-2 p-3 rounded text-white font-poppins text-[0.95rem] font-medium transition-all ${
            editando
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {editando ? <FaEdit /> : <FaPlus />}
          {editando ? "Atualizar Produto" : "Adicionar Produto"}
        </button>
        {editando && (
          <button
            onClick={() => {
              setEditando(null);
              setForm({ nome: "", quantidade_empresa: "", quantidade_rua: "" });
            }}
            className="mt-2 w-full flex items-center justify-center gap-2 p-3 rounded text-white font-poppins text-[0.95rem] font-medium transition-all bg-gray-600 hover:bg-gray-700"
            type="button"
          >
            Cancelar
          </button>
        )}
      </section>
      {isAdmin && (
        <div className="mt-0">
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-all font-poppins text-[0.95rem] font-medium mb-8"
          >
            Voltar ao Painel
          </button>
        </div>
      )}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-poppins text-[1.2rem] font-semibold">Estoque</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                className="flex items-center gap-2 bg-gray-700 text-white p-2 rounded hover:bg-gray-800 transition-all font-poppins text-[0.95rem] font-medium"
                onClick={() => setExportMenuOpen((open) => !open)}
                type="button"
              >
                Exportar <span className="ml-1">⏷</span>
              </button>
              {exportMenuOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-gray-800 border border-gray-700 rounded shadow-lg z-10">
                  <button
                    onClick={() => {
                      exportarPDF();
                      setExportMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => {
                      exportarCSV();
                      setExportMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    CSV
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={fetchProdutos}
              className="flex items-center gap-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-all font-poppins text-[0.95rem] font-medium"
              disabled={loading}
            >
              <FaSyncAlt className={loading ? "animate-spin" : ""} />
              Atualizar Lista
            </button>
          </div>
        </div>

        <ul className="bg-gray-800 p-6 rounded-lg shadow-md divide-y divide-gray-700">
          {produtos.map((produto) => (
            <li
              key={produto.id}
              className="py-4 flex justify-between items-center"
            >
              <div>
                <strong className="font-poppins text-[1.1rem] font-semibold">
                  {produto.nome}
                </strong>
                <p className="font-inter text-[0.9rem] font-normal text-gray-400">
                  Na empresa: {produto.quantidade_empresa} | Em rota de entrega:{" "}
                  {produto.quantidade_rua} | Total:{" "}
                  {produto.quantidade_empresa + produto.quantidade_rua}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => excluirProduto(produto.id)}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-all font-poppins text-[0.95rem] font-medium"
                >
                  <FaTrash /> Excluir
                </button>
                <button
                  onClick={() => editarProduto(produto.id)}
                  className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-all font-poppins text-[0.95rem] font-medium"
                >
                  <FaEdit /> Editar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <span className="flex items-center gap-1 font-inter text-[0.9rem] font-normal text-gray-500 mt-10 mb-0">
        Desenvolvido por:{" "}
        <a
          href="https://www.linkedin.com/in/gustavo-henrique-6b8352304/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Gustavo Henrique
        </a>
      </span>
    </main>
  );
}
