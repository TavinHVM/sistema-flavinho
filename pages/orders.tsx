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
  preco: number; // Adicionado campo preco
};

export default function Orders() {
  const [form, setForm] = useState<Pedido & { materiais: PedidoItem[] }>({
    preco: 0,
    data_locacao: "",
    data_evento: "",
    data_devolucao: "",
    cliente: "",
    cpf: "",
    endereco: "",
    telefone: "",
    residencial: "",
    referencia: "",
    materiais: [{ nome: "", quantidade: 1, valor_unit: 0, valor_total: 0, preco: 0 }],
    pagamento: "",
    valor_total: 0,
    valor_pago: 0,
    valor_deve: 0,
    // Campos de responsabilidades
    resp_entregou: "",
    data_entregou: "",
    hora_entregou: "",
    resp_recebeu: "",
    data_recebeu: "",
    hora_recebeu: "",
    resp_buscou: "",
    data_buscou: "",
    hora_buscou: "",
    resp_forro: "",
    data_forro: "",
    hora_forro: "",
    resp_utensilio: "",
    data_utensilio: "",
    hora_utensilio: "",
    obs: "",
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
            preco: Number(p.preco ?? 0), // Adicionado campo preco
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
    setForm({ ...form, materiais: [...form.materiais, { nome: "", quantidade: 1, valor_unit: 0, valor_total: 0, preco: 0 }] });
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

    // Validação: Verificar se há estoque suficiente
    for (const item of form.materiais) {
      if (!item.nome || item.quantidade <= 0) {
        setToast({ type: 'error', message: 'Todos os itens devem ter nome e quantidade válidos.' });
        return;
      }
      
      const produto = produtos.find((p) => p.nome === item.nome);
      if (!produto) {
        setToast({ type: 'error', message: `Produto "${item.nome}" não encontrado no estoque.` });
        return;
      }
      
      if (produto.quantidade_empresa < item.quantidade) {
        setToast({ 
          type: 'error', 
          message: `Estoque insuficiente para "${item.nome}". Disponível: ${produto.quantidade_empresa}, Solicitado: ${item.quantidade}` 
        });
        return;
      }
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
    const valor_total = form.materiais.reduce((acc: number, m: PedidoItem) => acc + (m.valor_total || 0), 0) || "0";
    // Se for edição (form.numero existe em pedidos), faz update
    const pedidoParaSalvar = {
      data_locacao: form.data_locacao ? toISODate(form.data_locacao) : null,
      data_evento: form.data_evento ? toISODate(form.data_evento) : null,
      data_devolucao: form.data_devolucao ? toISODate(form.data_devolucao) : null,
      cliente: form.cliente,
      cpf: form.cpf,
      endereco: form.endereco,
      telefone: form.telefone,
      residencial: form.residencial,
      referencia: form.referencia,
      pagamento: form.pagamento,
      valor_total,
      valor_pago: form.valor_pago,
      valor_deve: form.valor_deve,
      materiais: form.materiais,
      created_at: new Date().toISOString(),
      // Campos de responsabilidades
      resp_entregou: form.resp_entregou || null,
      data_entregou: form.data_entregou ? toISODate(form.data_entregou) : null,
      hora_entregou: form.hora_entregou || null,
      resp_recebeu: form.resp_recebeu || null,
      data_recebeu: form.data_recebeu ? toISODate(form.data_recebeu) : null,
      hora_recebeu: form.hora_recebeu || null,
      resp_buscou: form.resp_buscou || null,
      data_buscou: form.data_buscou ? toISODate(form.data_buscou) : null,
      hora_buscou: form.hora_buscou || null,
      resp_forro: form.resp_forro || null,
      data_forro: form.data_forro ? toISODate(form.data_forro) : null,
      hora_forro: form.hora_forro || null,
      resp_utensilio: form.resp_utensilio || null,
      data_utensilio: form.data_utensilio ? toISODate(form.data_utensilio) : null,
      hora_utensilio: form.hora_utensilio || null,
      obs: form.obs || null,
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
        preco: 0,
        data_locacao: "",
        data_evento: "",
        data_devolucao: "",
        cliente: "",
        cpf: "",
        endereco: "",
        telefone: "",
        residencial: "",
        referencia: "",
        materiais: [{ nome: "", quantidade: 1, valor_unit: 0, valor_total: 0, preco: 0 }],
        pagamento: "",
        valor_total: 0,
        valor_pago: 0,
        valor_deve: 0,
        // Campos de responsabilidades
        resp_entregou: "",
        data_entregou: "",
        hora_entregou: "",
        resp_recebeu: "",
        data_recebeu: "",
        hora_recebeu: "",
        resp_buscou: "",
        data_buscou: "",
        hora_buscou: "",
        resp_forro: "",
        data_forro: "",
        hora_forro: "",
        resp_utensilio: "",
        data_utensilio: "",
        hora_utensilio: "",
        obs: "",
      });
      setIsEditing(false);
      fetchPedidos();
    } else {
      setToast({ type: 'error', message: 'Erro ao salvar pedido!' });
    }
  };

  // Função para processar devolução
  const processarDevolucao = async (pedido: Pedido, itensDevolvidos: any[], observacoes: string) => {
    try {
      const usuario = localStorage.getItem("user") 
        ? JSON.parse(localStorage.getItem("user")!).nome 
        : "Não informado";

      // Inserir registros na tabela de devoluções
      for (const item of itensDevolvidos) {
        const { error: devolucaoError } = await supabase
          .from("devolucoes")
          .insert({
            numero_pedido: pedido.numero,
            nome_produto: item.nome,
            quantidade_devolvida: item.devolucao_atual,
            responsavel_devolucao: usuario,
            observacoes: observacoes || null,
          });

        if (devolucaoError) {
          setToast({ type: 'error', message: `Erro ao registrar devolução: ${devolucaoError.message}` });
          return;
        }

        // Atualizar estoque - mover de "rua" de volta para "empresa"
        const produto = produtos.find((p) => p.nome === item.nome);
        if (produto) {
          const novaEmpresa = produto.quantidade_empresa + item.devolucao_atual;
          const novaRua = produto.quantidade_rua - item.devolucao_atual;
          
          if (novaRua < 0) {
            setToast({ type: 'error', message: `Erro: Tentativa de devolver mais itens do que está em rota para "${item.nome}"` });
            return;
          }

          const { error: estoqueError } = await supabase
            .from("produtos")
            .update({ 
              quantidade_empresa: novaEmpresa, 
              quantidade_rua: novaRua 
            })
            .eq("numero", produto.numero);

          if (estoqueError) {
            setToast({ type: 'error', message: 'Erro ao atualizar estoque!' });
            return;
          }
        }
      }

      setToast({ type: 'success', message: 'Devolução registrada com sucesso!' });
      fetchPedidos();
      
      // Atualizar lista de produtos para refletir as mudanças no estoque
      const { data } = await supabase.from("produtos").select("*");
      if (data) {
        setProdutos(
          data.map((p: Record<string, unknown>) => ({
            id: p.id ? String(p.id) : String(p.numero),
            numero: String(p.numero ?? ""),
            nome: String(p.nome ?? ""),
            quantidade_empresa: Number(p.quantidade_empresa ?? 0),
            quantidade_rua: Number(p.quantidade_rua ?? 0),
            preco: Number(p.preco ?? 0),
          }))
        );
      }
    } catch (error) {
      console.error('Erro ao processar devolução:', error);
      setToast({ type: 'error', message: 'Erro ao processar devolução!' });
    }
  };

  // Filtro
  const pedidosFiltrados = pedidos.filter((p) => {
    const searchTerm = search.toLowerCase();
    
    // Se o termo de busca contém apenas números, assume que é pesquisa por CPF
    const isNumericSearch = /^\d+$/.test(search);
    
    if (isNumericSearch) {
      // Para CPF: busca rigorosa - deve começar com a sequência digitada
      return p.cpf.startsWith(search);
    } else {
      // Para nome: busca flexível - pode conter em qualquer parte
      return p.cliente.toLowerCase().includes(searchTerm);
    }
  });

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
                preco: 0,
                data_locacao: "",
                data_evento: "",
                data_devolucao: "",
                cliente: "",
                cpf: "",
                endereco: "",
                telefone: "",
                residencial: "",
                referencia: "",
                materiais: [{ nome: "", quantidade: 1, valor_unit: 0, valor_total: 0, preco: 0 }],
                pagamento: "",
                valor_total: 0,
                valor_pago: 0,
                valor_deve: 0,
                // Campos de responsabilidades
                resp_entregou: "",
                data_entregou: "",
                hora_entregou: "",
                resp_recebeu: "",
                data_recebeu: "",
                hora_recebeu: "",
                resp_buscou: "",
                data_buscou: "",
                hora_buscou: "",
                resp_forro: "",
                data_forro: "",
                hora_forro: "",
                resp_utensilio: "",
                data_utensilio: "",
                hora_utensilio: "",
                obs: "",
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
            placeholder="Pesquisar por cliente ou CPF"
          />
        </div>
        <OrderList
          pedidos={pedidosFiltrados}
          search={search}
          onEditar={(pedido) => {
            setForm({
              ...pedido,
              valor_pago: pedido.valor_pago || 0,
              valor_deve: pedido.valor_deve || 0,
              materiais: pedido.materiais.map((mat: PedidoItem) => ({
                nome: mat.nome,
                quantidade: mat.quantidade,
                valor_unit: mat.valor_unit,
                valor_total: mat.valor_total,
                preco: mat.preco || 0, // Garantir que preco esteja definido
              })),
              // Campos de responsabilidades
              resp_entregou: pedido.resp_entregou || "",
              data_entregou: pedido.data_entregou || "",
              hora_entregou: pedido.hora_entregou || "",
              resp_recebeu: pedido.resp_recebeu || "",
              data_recebeu: pedido.data_recebeu || "",
              hora_recebeu: pedido.hora_recebeu || "",
              resp_buscou: pedido.resp_buscou || "",
              data_buscou: pedido.data_buscou || "",
              hora_buscou: pedido.hora_buscou || "",
              resp_forro: pedido.resp_forro || "",
              data_forro: pedido.data_forro || "",
              hora_forro: pedido.hora_forro || "",
              resp_utensilio: pedido.resp_utensilio || "",
              data_utensilio: pedido.data_utensilio || "",
              hora_utensilio: pedido.hora_utensilio || "",
              obs: pedido.obs || "",
            });
            setIsEditing(true);
            setTimeout(() => {
              const formEl = document.querySelector('#order-form-scroll');
              if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          onExcluir={(id) => setConfirmDelete({ open: true, id })}
          onDevolucao={processarDevolucao}
        />
      </main>
    </>
  );
}
