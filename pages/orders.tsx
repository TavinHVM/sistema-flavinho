import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "@/components/header";
import SectionTitle from "@/components/SectionTitle";
import SearchInput from "@/components/SearchInput";
import OrderForm from "@/components/OrderForm";
import OrderList from "@/components/OrderList";
import OrderExportMenu from "@/components/OrderExportMenu";
import { useRouter } from "next/router";

interface PedidoItem {
  nome: string;
  quantidade: number;
  valor_unit: number;
  valor_total: number;
}

interface Pedido {
  id: string;
  numero: string;
  data_locacao: string;
  data_evento: string;
  data_retirada: string;
  cliente: string;
  endereco: string;
  telefone: string;
  residencial: string;
  referencia: string;
  materiais: PedidoItem[];
  entrega: string;
  busca: string;
  pagamento: string;
  valor_pago: number;
  valor_total: number;
  responsavel_entregou: string;
  responsavel_recebeu: string;
  responsavel_buscou: string;
  responsavel_conferiu_forro: string;
  responsavel_conferiu_utensilio: string;
  assinatura: string;
  created_at: string;
}

interface OrderListProps {
  pedidos: Pedido[];
  search: string;
  onEditarPedido: (pedido: any) => void;
  onExcluirPedido: (id: any) => Promise<void>;
  onExportarPedidoPDF: (pedido: { numero: any; cliente: any; }) => void;
}

export default function Orders() {
  const [form, setForm] = useState<any>({
    numero: "",
    data_locacao: "",
    data_evento: "",
    data_retirada: "",
    cliente: "",
    endereco: "",
    telefone: "",
    residencial: "",
    referencia: "",
    materiais: [{ nome: "", quantidade: 1, valor_unit: 0, valor_total: 0 }],
    entrega: "",
    busca: "",
    pagamento: "",
    valor_pago: "",
    valor_total: "",
    responsavel_entregou: "",
    responsavel_recebeu: "",
    responsavel_buscou: "",
    responsavel_conferiu_forro: "",
    responsavel_conferiu_utensilio: "",
    assinatura: "",
  });
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProdutos = async () => {
      const { data } = await supabase.from("produtos").select("*");
      if (data) setProdutos(data);
    };
    fetchProdutos();
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    const { data } = await supabase.from("pedidos").select("*").order("created_at", { ascending: false });
    if (data) setPedidos(data);
    setLoading(false);
  };
  useEffect(() => { fetchPedidos(); }, []);

  const handleMaterialChange = (idx: number, field: string, value: any) => {
    const materiais = [...form.materiais];
    materiais[idx][field] = value;
    if (field === "quantidade" || field === "valor_unit") {
      materiais[idx].valor_total = (materiais[idx].quantidade || 0) * (materiais[idx].valor_unit || 0);
    }
    setForm({ ...form, materiais });
  };

  const addMaterial = () => {
    setForm({ ...form, materiais: [...form.materiais, { nome: "", quantidade: 1, valor_unit: 0, valor_total: 0 }] });
  };
  
  const removeMaterial = (idx: number) => {
    const materiais = [...form.materiais];
    materiais.splice(idx, 1);
    setForm({ ...form, materiais });
  };

  const salvarPedido = async () => {
    if (!form.cliente || form.materiais.length === 0) {
      alert("Preencha o nome do cliente e pelo menos um item.");
      return;
    }
    // Atualizar estoque
    for (const item of form.materiais) {
      const produto = produtos.find((p) => p.nome === item.nome);
      if (produto) {
        const novaEmpresa = produto.quantidade_empresa - item.quantidade;
        const novaRua = produto.quantidade_rua + item.quantidade;
        await supabase.from("produtos").update({ quantidade_empresa: novaEmpresa, quantidade_rua: novaRua }).eq("id", produto.id);
      }
    }
    // Calcular valor total
    const valor_total = form.materiais.reduce((acc: number, m: any) => acc + (m.valor_total || 0), 0);
    // Salvar pedido
    const pedidoParaSalvar = {
      ...form,
      valor_total,
      valor_pago: parseFloat(form.valor_pago || 0),
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("pedidos").insert([pedidoParaSalvar]);
    if (!error) {
      alert("Pedido salvo!");
      setForm({
        numero: "",
        data_locacao: "",
        data_evento: "",
        data_retirada: "",
        cliente: "",
        endereco: "",
        telefone: "",
        residencial: "",
        referencia: "",
        materiais: [{ nome: "", quantidade: 1, valor_unit: 0, valor_total: 0 }],
        entrega: "",
        busca: "",
        pagamento: "",
        valor_pago: "",
        valor_total: "",
        responsavel_entregou: "",
        responsavel_recebeu: "",
        responsavel_buscou: "",
        responsavel_conferiu_forro: "",
        responsavel_conferiu_utensilio: "",
        assinatura: "",
      });
      fetchPedidos();
    } else {
      alert("Erro ao salvar pedido!");
    }
  };

  // Exportar PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Pedidos - Flavinho Festas", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [["Cliente", "Data Locação", "Itens", "Total"]],
      body: pedidos.map((p) => [
        p.cliente,
        p.data_locacao,
        p.materiais.map((m: any) => `${m.nome} (${m.quantidade})`).join(", "),
        `R$ ${p.valor_total?.toFixed(2)}`,
      ]),
    });
    doc.save(`Pedidos - Flavinho Festas.pdf`);
  };

  const handleEditarPedido = (pedido: any) => {
    setForm(pedido);
  };

  const handleExcluirPedido = async (id: any) => {
    if (window.confirm("Tem certeza que deseja excluir este pedido?")) {
      await supabase.from("pedidos").delete().eq("id", id);
      fetchPedidos();
    }
  };

  const exportarPedidoPDF = (pedido: any) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`CONTRATO DE LOCAÇÃO`, 14, 14);
    doc.setFontSize(12);
    doc.text(`Contrato Nº: ${pedido.numero}`, 14, 24);
    doc.text(`Data da Locação: ${pedido.data_locacao || ""}`, 14, 32);
    doc.text(`Data do Evento: ${pedido.data_evento || ""}`, 14, 40);
    doc.text(`Data de Retirada: ${pedido.data_retirada || ""}`, 14, 48);
    doc.text(`Data de Devolução: ${pedido.data_devolucao || ""}`, 14, 56);
    doc.text(`Cliente: ${pedido.cliente || ""}`, 14, 64);
    doc.text(`CPF: ${pedido.cpf || ""}`, 14, 72);
    doc.text(`Endereço: ${pedido.endereco || ""}`, 14, 80);
    doc.text(`Telefone: ${pedido.telefone || ""}`, 14, 88);
    doc.text(`Residencial: ${pedido.residencial || ""}`, 14, 96);
    doc.text(`Referência: ${pedido.referencia || ""}`, 14, 104);

    // Materiais
    doc.setFontSize(13);
    doc.text("Materiais:", 14, 114);
    doc.setFontSize(11);
    let y = 120;
    doc.text("Qtd", 14, y);
    doc.text("Material", 30, y);
    doc.text("V. Unit.", 120, y);
    doc.text("V. Total", 150, y);
    y += 6;
    pedido.materiais.forEach((mat: any) => {
      doc.text(String(mat.quantidade), 14, y);
      doc.text(mat.nome, 30, y);
      doc.text(`R$ ${(mat.valor_unit || 0).toFixed(2)}`, 120, y);
      doc.text(`R$ ${(mat.valor_total || 0).toFixed(2)}`, 150, y);
      y += 6;
    });
    y += 2;
    doc.setFontSize(12);
    doc.text(`Valor Pago: R$ ${(pedido.valor_pago || 0).toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Valor Total: R$ ${(pedido.valor_total || 0).toFixed(2)}`, 14, y);
    y += 8;
    doc.setFontSize(11);
    doc.text(`Entrega: ${pedido.entrega || ""}`, 14, y);
    y += 6;
    doc.text(`Busca: ${pedido.busca || ""}`, 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text("Responsáveis:", 14, y);
    y += 6;
    doc.setFontSize(11);
    doc.text(`Entregou: ${pedido.responsavel_entregou || ""}   Data: ${pedido.data_entregou || ""}`, 14, y);
    y += 6;
    doc.text(`Recebeu: ${pedido.responsavel_recebeu || ""}   Data: ${pedido.data_recebeu || ""}`, 14, y);
    y += 6;
    doc.text(`Buscou: ${pedido.responsavel_buscou || ""}   Data: ${pedido.data_buscou || ""}`, 14, y);
    y += 6;
    doc.text(`Conferiu Forro: ${pedido.responsavel_conferiu_forro || ""}`, 14, y);
    y += 6;
    doc.text(`Conferiu Utensílio: ${pedido.responsavel_conferiu_utensilio || ""}`, 14, y);
    y += 12;
    doc.setFontSize(11);
    doc.text("CERTIFICO QUE EU CONFERI TODO MATERIAL E RESPONSABILIZO POR TODO E QUALQUER MATERIAL PRESCRITO NESTE CONTRATO.", 14, y, { maxWidth: 180 });
    y += 16;
    doc.text("Assinatura: ___________________________________________", 14, y);
    doc.save(`Pedido_${pedido.numero}.pdf`);
  };

  // Filtro
  const pedidosFiltrados = pedidos.filter((p) =>
    p.cliente.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="p-2 sm:p-4 max-w-full md:max-w-2xl mx-auto bg-[rgb(26,34,49)] text-white rounded-lg shadow-lg mt-4 mb-4">
        <button
          className="mb-4 bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded w-full sm:w-auto"
          onClick={() => router.push("/dashboard")}
        >
          Voltar ao Painel
        </button>
        <SectionTitle className="mt-2 mb-2">Novo Pedido</SectionTitle>
        <OrderForm
          form={form}
          setForm={setForm}
          produtos={produtos}
          onSubmit={salvarPedido}
          handleMaterialChange={handleMaterialChange}
          addMaterial={addMaterial}
          removeMaterial={removeMaterial}
          loading={loading}
        />
        <SectionTitle className="mt-8 mb-2">Pedidos</SectionTitle>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por cliente" />
          <OrderExportMenu onExportarPDF={exportarPDF} />
        </div>
        <OrderList
          pedidos={pedidos}
          search={search}
          onEditar={handleEditarPedido}
          onExcluir={handleExcluirPedido}
          onExportarPDF={exportarPedidoPDF}
        />
      </main>
    </>
  );
}