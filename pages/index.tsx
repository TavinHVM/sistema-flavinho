import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "@/components/Header";
import ProdutoList from "@/components/ProdutoList";
import ProdutoForm from "@/components/ProdutoForm";
import ExportMenu from "@/components/ExportMenu";
import Footer from "@/components/Footer";
import HeaderBar from "@/components/HeaderBar";
import SectionTitle from "@/components/SectionTitle";
import SearchInput from "@/components/SearchInput";
import RefreshButton from "@/components/RefreshButton";
import PainelAdminButton from "@/components/PainelAdminButton";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const fetchProdutos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*"); // Remova a ordenação do Supabase, pois faremos no frontend

    if (!error && data) {
      // Ordenação numérica extraindo o número do nome (ex: "Produto 10")
      const sorted = [...data].sort((a, b) => {
        const regex = /(\d+)/;
        const aMatch = a.nome.match(regex);
        const bMatch = b.nome.match(regex);
        if (aMatch && bMatch) {
          return Number(aMatch[1]) - Number(bMatch[1]);
        }
        return a.nome.localeCompare(b.nome, 'pt-BR');
      });
      setProdutos(sorted);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setIsLoggedIn(false);
        router.replace("/login");
        return;
      }
      setIsLoggedIn(true);
      fetchProdutos();
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user.role === "Administrador" || user.role === "Funcionario");
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
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
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

  if (isLoggedIn === null) {
    // Em verificação
    return null;
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center bg-[rgb(26,34,49)] text-white px-2">
        <div className="mt-10 text-center text-lg text-yellow-400">
          {"Você precisa estar logado para acessar esta página."}
        </div>
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col justify-between bg-[rgb(26,34,49)] text-white rounded-lg shadow-lg mt-0 md:mt-0 mb-0 md:mb-0 p-2 sm:p-4 md:p-8 max-w-full md:max-w-4xl mx-auto">
        {isAdmin && (
          <div className="mt-0 mb-14">
            <PainelAdminButton onClick={() => router.push('/dashboard')} />
          </div>
        )}
        <HeaderBar />
        <div ref={formRef}>
          <ProdutoForm
            form={form}
            setForm={setForm}
            onSubmit={editando ? atualizarProduto : adicionarProduto}
            editando={!!editando}
            onCancel={
              editando
                ? () => {
                  setEditando(null);
                  setForm({ nome: '', quantidade_empresa: '', quantidade_rua: '' });
                }
                : undefined
            }
          />
        </div>
        <section className="flex-1 flex flex-col justify-between">
          {/* Agora ocupa toda a largura da tabela */}
          <div className="flex flex-col items-stretch gap-2 mb-2 w-full">
            <SectionTitle className="w-full text-center mt-10">Estoque</SectionTitle>
            <div className="relative w-full" ref={exportMenuRef}>
              <ExportMenu
                open={exportMenuOpen}
                setOpen={setExportMenuOpen}
                onExportarPDF={exportarPDF}
                onExportarCSV={exportarCSV}
              />
            </div>
            <RefreshButton onClick={fetchProdutos} loading={loading} />
            <SearchInput
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar por nome"
            />
          </div>
          <ProdutoList
            produtos={produtos.map((p, idx) => ({ ...p, numero: idx + 1 }))}
            search={search}
            onEditar={editarProduto}
            onExcluir={excluirProduto}
          />
        </section>
        <div className="flex justify-center text-xs text-gray-400 text-center mt-auto">
          <Footer />
        </div>
      </main>
    </>
  );
}