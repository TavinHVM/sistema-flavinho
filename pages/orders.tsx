import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "@/components/Header";
import SectionTitle from "@/components/SectionTitle";
import OrderForm from "@/components/OrderForm";
import OrderList from "@/components/OrderList";
import { Pedido, PedidoItem } from "../types/Pedido";
import PainelAdminButton from "@/components/PainelAdminButton";

type PedidoItemField = keyof PedidoItem;
// Função utilitária para converter data pt-BR para ISO (yyyy-mm-dd)
function toISODate(dateStr: string): string {
  if (!dateStr) return "";
  // Se já estiver no formato yyyy-mm-dd, retorna direto
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Se estiver no formato dd/mm/yyyy
  const [d, m, y] = dateStr.split("/");
  if (d && m && y) return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  return dateStr;
}

export default function Orders() {
  const [form, setForm] = useState<Pedido & { materiais: PedidoItem[] }>({
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
  });
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<{ id: string; nome: string; quantidade_empresa: number; quantidade_rua: number }[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setIsLoggedIn(false);
      window.location.replace("/login");
      return;
    }
    setIsLoggedIn(true);
  }, []);

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
      materiais[idx][field] = Number(value) as PedidoItem[typeof field];
    } else if (field === "nome") {
      materiais[idx][field] = value as PedidoItem[typeof field];
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
      data_locacao: form.data_locacao ? toISODate(form.data_locacao) : null,
      data_evento: form.data_evento ? toISODate(form.data_evento) : null,
      data_retirada: form.data_retirada ? toISODate(form.data_retirada) : null,
      data_devolucao: form.data_devolucao ? toISODate(form.data_devolucao) : null,
      data_entregou: form.data_entregou ? toISODate(form.data_entregou) : null,
      data_recebeu: form.data_recebeu ? toISODate(form.data_recebeu) : null,
      data_buscou: form.data_buscou ? toISODate(form.data_buscou) : null,
      valor_total,
      valor_pago: parseFloat(form.valor_pago?.toString() || "0"),
      desconto: parseFloat(form.desconto?.toString() || "0"),
      created_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("pedidos").insert([pedidoParaSalvar]);
    if (!error) {
      alert("Pedido salvo!");
      setForm({
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
      });
      fetchPedidos();
    } else {
      alert("Erro ao salvar pedido!");
    }
  };

  // Filtro
  const pedidosFiltrados = pedidos.filter((p) =>
    p.cliente.toLowerCase().includes(search.toLowerCase())
  );

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
      <main className="p-2 sm:p-4 max-w-full md:max-w-3xl mx-auto bg-[rgb(26,34,49)] text-white rounded-lg shadow-lg mt-4 mb-4">
        <PainelAdminButton />
        <div className="flex justify-center">
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
        </div>
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
        />
      </main>
    </>
  );
}
