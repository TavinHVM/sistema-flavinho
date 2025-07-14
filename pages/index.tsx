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
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import logoBase64 from "@/components/logoBase64";

type Produto = {
  numero: number;
  nome: string;
  quantidade_empresa: number;
  quantidade_rua: number;
  preco: number;
  created_at: string;
};

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState({
    nome: "",
    quantidade_empresa: "",
    quantidade_rua: "",
    preco: "",
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const router = useRouter();
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const fetchProdutos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("produtos")
      .select("*");
    if (!error && data) {
      const sorted = [...data].sort((a, b) => a.numero - b.numero);
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
    const preco = parseInt(form.preco || "0", 10); // preco em centavos

    if (!form.nome.trim()) {
      setToast({ type: 'error', message: 'Por favor, preencha o nome do produto.' });
      return;
    }

    if (isNaN(quantidadeEmpresa) || isNaN(quantidadeRua) || isNaN(preco)) {
      setToast({ type: 'error', message: 'Por favor, preencha as quantidades e o preço corretamente.' });
      return;
    }

    // Buscar o maior numero atual
    const { data: maxNumeroData } = await supabase.from("produtos").select("numero").order("numero", { ascending: false }).limit(1);
    const nextNumero = (maxNumeroData && maxNumeroData[0] && maxNumeroData[0].numero ? Number(maxNumeroData[0].numero) : 0) + 1;

    const produtoParaSalvar = {
      nome: form.nome,
      quantidade_empresa: quantidadeEmpresa,
      quantidade_rua: quantidadeRua,
      preco: preco,
      numero: nextNumero,
    };

    const { error } = await supabase
      .from("produtos")
      .insert([produtoParaSalvar]);

    if (!error) {
      setForm({ nome: "", quantidade_empresa: "", quantidade_rua: "", preco: "" });
      setToast({ type: 'success', message: 'Produto adicionado com sucesso!' });
      fetchProdutos();
    } else {
      setToast({ type: 'error', message: 'Erro ao adicionar produto!' });
    }
  };

  const excluirProduto = async (numero: number) => {
    setConfirmDelete({ open: true, id: numero.toString() });
  };

  const confirmarExclusaoProduto = async () => {
    if (!confirmDelete.id) return;
    const { error } = await supabase.from("produtos").delete().eq("numero", Number(confirmDelete.id));
    setConfirmDelete({ open: false, id: null });
    if (!error) {
      setToast({ type: 'success', message: 'Produto excluído com sucesso!' });
      fetchProdutos();
    } else {
      setToast({ type: 'error', message: 'Erro ao excluir produto!' });
    }
  };

  const editarProduto = async (numero: number) => {
    const { data } = await supabase
      .from("produtos")
      .select("*")
      .eq("numero", numero)
      .single();

    if (data) {
      setForm({
        nome: data.nome,
        quantidade_empresa: data.quantidade_empresa.toString(),
        quantidade_rua: data.quantidade_rua.toString(),
        preco: data.preco ? data.preco.toString() : "",
      });
      setEditando(numero);
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  };

  const atualizarProduto = async () => {
    if (!editando) return;

    const quantidadeEmpresa = parseInt(form.quantidade_empresa);
    const quantidadeRua = parseInt(form.quantidade_rua);
    const preco = parseInt(form.preco || "0", 10); // preco em centavos

    if (isNaN(quantidadeEmpresa) || isNaN(quantidadeRua) || isNaN(preco)) {
      setToast({ type: 'error', message: 'Por favor, preencha as quantidades e o preço corretamente.' });
      return;
    }

    const produtoParaAtualizar = {
      nome: form.nome,
      quantidade_empresa: quantidadeEmpresa,
      quantidade_rua: quantidadeRua,
      preco: preco,
    };

    const { error } = await supabase
      .from("produtos")
      .update(produtoParaAtualizar)
      .eq("numero", editando);

    if (!error) {
      setForm({ nome: "", quantidade_empresa: "", quantidade_rua: "", preco: "" });
      setEditando(null);
      setToast({ type: 'success', message: 'Produto atualizado com sucesso!' });
      fetchProdutos();
    } else {
      setToast({ type: 'error', message: 'Erro ao atualizar produto!' });
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

    const pageWidth = doc.internal.pageSize.getWidth();

    // Adiciona a logo se estiver válida
    if (logoBase64 && logoBase64.startsWith("data:image/png;base64")) {
      try {
        doc.addImage(logoBase64, 'PNG', 14, 10, 20, 20);
      } catch (error) {
        console.error("Erro ao adicionar imagem:", error);
      }
    }

    // Título centralizado
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.addImage(logoBase64, 'PNG', 14, 10, 20, 20);
    doc.text("Flavinho Festas", pageWidth / 2, 18, { align: "center" });
    doc.setFontSize(12);
    doc.text("Relatório de Estoque", pageWidth / 2, 24, { align: "center" });
    doc.setFontSize(10);
    doc.text("Todos os produtos cadastrados", pageWidth / 2, 30, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("https://sistema-flavinho.vercel.app/", pageWidth / 2, 36, { align: "center" });
    doc.setTextColor(0);

    // Data/hora no canto direito
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const text = `Gerado em: ${dataHora}`;
    const textWidth = doc.getTextWidth(text);
    doc.text(text, pageWidth - textWidth - 14, 26);

    // Tabela
    autoTable(doc, {
      startY: 45,
      head: [["Nome", "Qtde. Empresa", "Qtde. Entrega", "Total"]],
      body: produtos.map((p) => [
        p.nome,
        p.quantidade_empresa,
        p.quantidade_rua,
        p.quantidade_empresa + p.quantidade_rua,
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        halign: 'center',
        fontStyle: 'bold',
      },
      bodyStyles: {
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      styles: {
        fontSize: 10,
      }
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
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        open={confirmDelete.open}
        onConfirm={confirmarExclusaoProduto}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        message="Tem certeza que deseja excluir este produto?"
      />
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
                  setForm({ nome: '', quantidade_empresa: '', quantidade_rua: '', preco: '' });
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
            produtos={produtos}
            search={search}
            onEditar={(numero) => {
              // Fechar modal antes de editar
              editarProduto(numero);
            }}
            onExcluir={(numero) => {
              // Fechar modal antes de excluir
              excluirProduto(numero);
            }}
          />
        </section>
        <div className="flex justify-center text-xs text-gray-400 text-center mt-auto">
          <Footer />
        </div>
      </main>
    </>
  );
}