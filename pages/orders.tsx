import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Header from "@/components/Header";
import SectionTitle from "@/components/SectionTitle";
import OrderForm from "@/components/OrderForm";
import OrderList from "@/components/OrderList";
import { Pedido, PedidoItem } from "../types/Pedido";
import PainelAdminButton from "@/components/PainelAdminButton";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import RefreshButton from "@/components/RefreshButton";

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

type ProdutoLocal = {
  id: string;
  numero: string;
  nome: string;
  quantidade_empresa: number;
  quantidade_rua: number;
};

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
    horario_entregou: "",
    horario_recebeu: "",
    horario_buscou: "",
  });
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [produtos, setProdutos] = useState<ProdutoLocal[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  const [isEditing, setIsEditing] = useState(false);

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
      if (data) {
        setProdutos(
          data.map((p: Record<string, unknown>) => ({
            id: p.id ? String(p.id) : String(p.numero),
            numero: String(p.numero ?? ""),
            nome: String(p.nome ?? ""),
            quantidade_empresa: Number(p.quantidade_empresa ?? 0),
            quantidade_rua: Number(p.quantidade_rua ?? 0),
          }))
        );
      }
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
      setToast({ type: 'error', message: 'Preencha o nome do cliente e pelo menos um item.' });
      return;
    }
    // Atualizar estoque
    for (const item of form.materiais) {
      const produto = produtos.find((p) => p.nome === item.nome);
      if (produto) {
        const novaEmpresa = produto.quantidade_empresa - item.quantidade;
        const novaRua = produto.quantidade_rua + item.quantidade;
        await supabase.from("produtos").update({ quantidade_empresa: novaEmpresa, quantidade_rua: novaRua }).eq("numero", produto.numero);
      }
    }
    // Calcular valor total
    const valor_total = form.materiais.reduce((acc: number, m: PedidoItem) => acc + (m.valor_total || 0), 0) - parseFloat(form.desconto?.toString() || "0");
    // Se for edição (form.numero existe em pedidos), faz update
    const pedidoParaSalvar = {
      data_locacao: form.data_locacao ? toISODate(form.data_locacao) : null,
      data_evento: form.data_evento ? toISODate(form.data_evento) : null,
      data_retirada: form.data_retirada ? toISODate(form.data_retirada) : null,
      data_devolucao: form.data_devolucao ? toISODate(form.data_devolucao) : null,
      cliente: form.cliente,
      cpf: form.cpf,
      endereco: form.endereco,
      telefone: form.telefone,
      residencial: form.residencial,
      referencia: form.referencia,
      pagamento: form.pagamento,
      valor_pago: parseFloat(form.valor_pago?.toString() || "0"),
      valor_total,
      desconto: parseFloat(form.desconto?.toString() || "0"),
      responsavel_entregou: form.responsavel_entregou,
      data_entregou: form.data_entregou ? toISODate(form.data_entregou) : null,
      responsavel_recebeu: form.responsavel_recebeu,
      data_recebeu: form.data_recebeu ? toISODate(form.data_recebeu) : null,
      responsavel_buscou: form.responsavel_buscou,
      data_buscou: form.data_buscou ? toISODate(form.data_buscou) : null,
      responsavel_conferiu_forro: form.responsavel_conferiu_forro,
      responsavel_conferiu_utensilio: form.responsavel_conferiu_utensilio,
      materiais: form.materiais,
      horario_entregou: form.horario_entregou,
      horario_recebeu: form.horario_recebeu,
      horario_buscou: form.horario_buscou,
      created_at: new Date().toISOString(),
    };
    const numeroPedido = form.numero ? Number(form.numero) : null;
    let error;
    if (numeroPedido && pedidos.some(p => Number(p.numero) === numeroPedido)) {
      // Update
      ({ error } = await supabase.from("pedidos").update(pedidoParaSalvar).eq("numero", numeroPedido));
    } else {
      // Buscar o maior numero atual
      const { data: maxNumeroData } = await supabase.from("pedidos").select("numero").order("numero", { ascending: false }).limit(1);
      const nextNumero = (maxNumeroData && maxNumeroData[0] && maxNumeroData[0].numero ? Number(maxNumeroData[0].numero) : 0) + 1;
      ({ error } = await supabase.from("pedidos").insert([{ ...pedidoParaSalvar, numero: nextNumero }]));
    }
    if (!error) {
      setToast({ type: 'success', message: isEditing ? 'Pedido atualizado!' : 'Pedido salvo!' });
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
        horario_entregou: "",
        horario_recebeu: "",
        horario_buscou: "",
      });
      setIsEditing(false);
      fetchPedidos();
    } else {
      setToast({ type: 'error', message: 'Erro ao salvar pedido!' });
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
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        open={confirmDelete.open}
        onConfirm={async () => {
          if (confirmDelete.id) {
            await supabase.from("pedidos").delete().eq("numero", confirmDelete.id);
            fetchPedidos();
            setToast({ type: 'success', message: 'Pedido excluído com sucesso!' });
          }
          setConfirmDelete({ open: false, id: null });
        }}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        message="Tem certeza que deseja excluir este pedido?"
      />
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
            isEditing={isEditing}
            onCancelEdit={() => {
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
                horario_entregou: "",
                horario_recebeu: "",
                horario_buscou: "",
              });
              setIsEditing(false);
            }}
          />
        </div>

        <div className="items-center justify-center">
          <SectionTitle className="text-center mt-12">Pedidos</SectionTitle>
          <div className="flex items-center justify-center mb-2">
            <RefreshButton onClick={fetchPedidos} loading={loading} />
          </div>
          <input
            className="rounded p-2 text-black mb-2 w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar por cliente"
          />
        </div>
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
            setIsEditing(true);
            setTimeout(() => {
              const formEl = document.querySelector('#order-form-scroll');
              if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          onExcluir={(id) => setConfirmDelete({ open: true, id })}
        />
      </main>
    </>
  );
}
