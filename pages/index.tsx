import { useEffect, useState, useRef } from "react";
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
import Header from "../components/header";

type Produto = {
  last_modified_by: string;
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
  const [search, setSearch] = useState("");
  const router = useRouter();
  const exportMenuRef = useRef<HTMLDivElement>(null);

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
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        router.replace("/login");
        return;
      }
      fetchProdutos();
    };

    checkSession();
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserEmail(user.email || "");
      setIsAdmin(user.role === "Administrador");
    }
  }, []);

  useEffect(() => {
    if (!exportMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setExportMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportMenuOpen]);

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
      last_modified_by: JSON.parse(localStorage.getItem("user") || "{}").nome || "",
      last_modified_at: new Date().toISOString(),
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
      last_modified_by: JSON.parse(localStorage.getItem("user") || "{}").nome || "",
      last_modified_at: new Date().toISOString(),
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

  function getDataHoraFormatada() {
    const agora = new Date();
    const dia = String(agora.getDate()).padStart(2, "0");
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const ano = agora.getFullYear();
    const hora = String(agora.getHours()).padStart(2, "0");
    const min = String(agora.getMinutes()).padStart(2, "0");
    return `${dia}-${mes}-${ano} ${hora}h${min}`;
  }

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <>
      <Header />
      <main className="p-8 max-w-4xl mx-auto bg-[rgb(26,34,49)] text-white rounded-lg shadow-lg mt-8 mb-8">
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
              <label className="mb-1 ml-1 text-white text-sm font-medium font-poppins">
                Nome
              </label>
              <input
                className="font-poppins p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do produto"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 ml-1 text-white text-sm font-medium font-poppins">
                Qtde. Empresa
              </label>
              <input
                type="number"
                className="font-inter p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Quantidade na empresa"
                value={form.quantidade_empresa}
                onChange={(e) =>
                  setForm({ ...form, quantidade_empresa: e.target.value })
                }
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 ml-1 text-white text-sm font-medium font-poppins">
                Qtde. Entrega
              </label>
              <input
                type="number"
                className="font-inter p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className={`mt-4 w-full flex items-center justify-center gap-2 p-3 rounded text-white font-poppins text-[0.95rem] font-medium transition-all ${editando
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
          <div className="flex items-center justify-between mb-4 gap-2">
            <h2 className="font-poppins text-[1.2rem] font-semibold">Estoque</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Pesquisar por nome"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 rounded bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter text-sm"
                style={{ minWidth: 180 }}
              />
              <div className="relative" ref={exportMenuRef}>
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

          <ul className="bg-gray-800 p-6 rounded-lg shadow-md">
            {produtos
              .filter((produto) =>
                produto.nome.toLowerCase().includes(search.toLowerCase())
              )
              .map((produto, idx, arr) => (
                <li
                  key={produto.id}
                  className={`py-4 flex justify-between items-center${idx !== arr.length - 1 ? " border-b border-gray-700" : ""}`}
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
                    <p className="text-sm text-gray-400 mt-1">
                      Última alteração por:{" "}
                      <strong className="text-gray-300 text-sm">
                        {produto.last_modified_by || "N/A"}
                      </strong>
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

        <span className="flex items-center gap-1 font-inter text-[0.9rem] font-normal text-gray-400 mt-10 mb-0">
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
    </>
  );
}
