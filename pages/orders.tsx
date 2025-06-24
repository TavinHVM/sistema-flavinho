import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Header from "@/components/Header";
import SectionTitle from "@/components/SectionTitle";
import OrderForm from "@/components/OrderForm";
import OrderList from "@/components/OrderList";
import { useRouter } from "next/router";
import { Pedido, PedidoItem } from "../types/Pedido";
import { formatDateBR } from "../lib/formatDate";

type PedidoItemField = keyof PedidoItem;

export default function Orders() {
  const [form, setForm] = useState<Pedido & { materiais: PedidoItem[] }>({
    numero: "",
    data_locacao: "",
    data_evento: "",
    data_retirada: "",
    data_devolucao: "",
    cliente: "",
    cpf: "",
    endereco: "",
    telefone: "",
    residencial: "",
    referencia: "",
    materiais: [{ nome: "", quantidade: 1, valor_unit: 0, valor_total: 0 }],
    entrega: "",
    busca: "",
    pagamento: "",
    valor_pago: 0,
    valor_total: 0,
    desconto: 0,
    responsavel_entregou: "",
    data_entregou: "",
    responsavel_recebeu: "",
    data_recebeu: "",
    responsavel_buscou: "",
    data_buscou: "",
    responsavel_conferiu_forro: "",
    responsavel_conferiu_utensilio: "",
    assinatura: "",
  });
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<{ id: string; nome: string; quantidade_empresa: number; quantidade_rua: number }[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleMaterialChange = (
    idx: number,
    field: PedidoItemField,
    value: string | number
  ) => {
    const materiais = [...form.materiais];
    if (field === "quantidade" || field === "valor_unit" || field === "valor_total") {
      materiais[idx][field] = Number(value) as any;
    } else if (field === "nome") {
      materiais[idx][field] = value as any;
    }
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
    const valor_total = form.materiais.reduce((acc: number, m: PedidoItem) => acc + (m.valor_total || 0), 0) - parseFloat(form.desconto?.toString() || "0");
    // Salvar pedido
    const pedidoParaSalvar = {
      ...form,
      valor_total,
      valor_pago: parseFloat(form.valor_pago?.toString() || "0"),
      desconto: parseFloat(form.desconto?.toString() || "0"),
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
        data_devolucao: "",
        cliente: "",
        cpf: "",
        endereco: "",
        telefone: "",
        residencial: "",
        referencia: "",
        materiais: [{ nome: "", quantidade: 1, valor_unit: 0, valor_total: 0 }],
        entrega: "",
        busca: "",
        pagamento: "",
        valor_pago: 0,
        valor_total: 0,
        desconto: 0,
        responsavel_entregou: "",
        data_entregou: "",
        responsavel_recebeu: "",
        data_recebeu: "",
        responsavel_buscou: "",
        data_buscou: "",
        responsavel_conferiu_forro: "",
        responsavel_conferiu_utensilio: "",
        assinatura: "",
      });
      fetchPedidos();
    } else {
      alert("Erro ao salvar pedido!");
    }
  };

  // PDF fiel ao contrato
  const exportarPedidoPDF = (pedido: Pedido) => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    // --- LOGO ---
    // Para adicionar a logo, converta o favicon.ico para base64 PNG e substitua abaixo:
    // Exemplo: const logoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANS...";
    // doc.addImage(logoBase64, 'PNG', 10, 6, 28, 18);

    // --- Cabeçalho ---
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text("FLAVINHO Espaço Locações & Festa", 42, 14);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text("CNPJ 25.192.935/0001-48 PIX", 42, 19);
    doc.text("Av. Bela Vista Qd. 18 Lt. 03 - Parque Trindade I - Ap. de Goiânia - GO", 42, 24);
    doc.setFontSize(10);
    doc.setTextColor(200, 0, 0);
    doc.text("ATENÇÃO: TODOS OS MATERIAIS DEVEM SER CONFERIDOS PELO CLIENTE NO RECEBIMENTO DO MESMO.", 10, 30);
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text("OBS.: QUALQUER DEFEITO NOS MESMOS SERÁ COBRADO O VALOR DO MESMO OU REPOSIÇÃO COM OUTRO DO MESMO MODELO.", 10, 34);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text("CONTRATO DE LOCAÇÃO", 80, 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    // --- Dados principais ---
    doc.text(`DATA DA LOCAÇÃO: ${formatDateBR(pedido.data_locacao)}`, 10, 48);
    doc.text(`DATA DO EVENTO: ${formatDateBR(pedido.data_evento)}`, 80, 48);
    doc.text(`DEVOLVER: ${formatDateBR(pedido.data_devolucao)}`, 150, 48);
    doc.text(`NOME: ${pedido.cliente || ""}`, 10, 54);
    doc.text(`CPF: ${pedido.cpf || ""}`, 150, 54);
    doc.text(`LOCAL DO EVENTO: ${pedido.endereco || ""}`, 10, 60);
    doc.text(`FONE CELULAR: ${pedido.telefone || ""}`, 150, 60);
    doc.text(`END. RESIDENCIAL: ${pedido.residencial || ""}`, 10, 66);
    doc.text(`FONE REFERÊNCIA: ${pedido.referencia || ""}`, 150, 66);
    // --- Materiais ---
    autoTable(doc, {
      startY: 72,
      head: [["QUANT.", "MATERIAL", "VALOR UNIT.", "VALOR TOTAL"]],
      body: pedido.materiais.map((mat: PedidoItem) => [
        mat.quantidade,
        mat.nome,
        `R$ ${(mat.valor_unit || 0).toFixed(2)}`,
        `R$ ${(mat.valor_total || 0).toFixed(2)}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [26, 34, 49], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 90 }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 } },
      margin: { left: 10, right: 10 },
      theme: 'grid',
      tableWidth: 170,
    });
    let y = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 6 : 78;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`RESP. ENTREGOU: ${pedido.responsavel_entregou || ""}   DATA: ${formatDateBR(pedido.data_entregou)}   HORÁRIO: ______   DESCONTO: R$ ${(pedido.desconto || 0).toFixed(2)}`, 10, y);
    y += 6;
    doc.text(`RESP. RECEBEU: ${pedido.responsavel_recebeu || ""}   DATA: ${formatDateBR(pedido.data_recebeu)}   HORÁRIO: ______`, 10, y);
    y += 6;
    doc.text(`RESP. BUSCOU: ${pedido.responsavel_buscou || ""}   DATA: ${formatDateBR(pedido.data_buscou)}   HORÁRIO: ______   TOTAL: R$ ${(pedido.valor_total || 0).toFixed(2)}`, 10, y);
    y += 6;
    doc.text(`RESP. CONFERIU FORRO: ${pedido.responsavel_conferiu_forro || ""}`, 10, y);
    y += 6;
    doc.text(`RESP. CONFERIU UTENSÍLIO: ${pedido.responsavel_conferiu_utensilio || ""}`, 10, y);
    y += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text("CERTIFICO QUE EU CONFERI TODO MATERIAL E RESPONSABILIZO POR TODO E QUALQUER MATERIAL PRESCRITO NESTE CONTRATO.", 10, y, { maxWidth: 180 });
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.text("ASSINATURA: ____________________________   CPF/RG: ____________________________", 10, y);
    doc.save(`Pedido_${pedido.numero || pedido.cliente}.pdf`);
  };

  // Filtro
  const pedidosFiltrados = pedidos.filter((p) =>
    p.cliente.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header />
      <main className="p-2 sm:p-4 max-w-full md:max-w-3xl mx-auto bg-[rgb(26,34,49)] text-white rounded-lg shadow-lg mt-4 mb-4">
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
          handleMaterialChange={
            handleMaterialChange as (idx: number, field: string, value: string | number) => void
          }
          addMaterial={addMaterial}
          removeMaterial={removeMaterial}
          loading={loading}
        />
        <SectionTitle className="mt-8 mb-2">Pedidos</SectionTitle>
        <input
          className="rounded p-2 text-black mb-2 w-full"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Pesquisar por cliente"
        />
        <OrderList
          pedidos={pedidosFiltrados}
          search={search}
          onEditar={(pedido) => {
            setForm({
              ...pedido,
              materiais: pedido.materiais.map((mat: PedidoItem) => ({
                nome: mat.nome,
                quantidade: mat.quantidade,
                valor_unit: mat.valor_unit,
                valor_total: mat.valor_total,
              })),
            });
          }}
          onExcluir={async (id) => { await supabase.from("pedidos").delete().eq("id", id); fetchPedidos(); }}
          onExportarPDF={exportarPedidoPDF}
        />
      </main>
    </>
  );
}
