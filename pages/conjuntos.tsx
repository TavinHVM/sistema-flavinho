import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Header from "@/components/Header";
import SectionTitle from "@/components/SectionTitle";
import ConjuntoForm from "@/components/ConjuntoForm";
import ConjuntoList from "@/components/ConjuntoList";
import SearchInput from "@/components/SearchInput";
import RefreshButton from "@/components/RefreshButton";
import PainelAdminButton from "@/components/PainelAdminButton";
import Toast from "@/components/Toast";
import ConfirmModal from "@/components/ConfirmModal";
import { Conjunto, ConjuntoCompleto } from "../types/Conjunto";

type Produto = {
  id: string;
  numero: string;
  nome: string;
  quantidade_empresa: number;
  quantidade_rua: number;
  preco: number;
};

export default function Conjuntos() {
  const router = useRouter();
  const [conjuntos, setConjuntos] = useState<ConjuntoCompleto[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null }>({ open: false, id: null });
  
  // Estados do formulário
  const [form, setForm] = useState<Conjunto>({
    nome: "",
    descricao: "",
    preco_promocional: 0,
    itens: [{ produto_nome: "", quantidade: 1 }]
  });
  const [editando, setEditando] = useState<number | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "Administrador" && user.role !== "Funcionario") {
      router.push("/");
      return;
    }

    setIsAdmin(true);
    fetchProdutos();
  }, [router]);

  // Recarregar conjuntos sempre que os produtos mudarem
  useEffect(() => {
    if (produtos.length > 0) {
      fetchConjuntos();
    }
  }, [produtos]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchProdutos = async () => {
    try {
      setLoadingData(true);
      const { data } = await supabase.from("produtos").select("*").order("nome");
      if (data) {
        setProdutos(
          data.map((p: { id?: unknown; numero?: unknown; nome?: unknown; quantidade_empresa?: unknown; quantidade_rua?: unknown; preco?: unknown }) => ({
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
      console.error("Erro ao buscar produtos:", error);
    }
  };

  const fetchConjuntos = async () => {
    setLoading(true);
    try {
      // Buscar conjuntos
      const { data: conjuntosData } = await supabase
        .from("conjuntos")
        .select("*")
        .order("numero", { ascending: false });

      if (conjuntosData) {
        // Buscar itens de cada conjunto
        const conjuntosCompletos: ConjuntoCompleto[] = [];
        
        for (const conjunto of conjuntosData) {
          const { data: itensData } = await supabase
            .from("conjunto_itens")
            .select("*")
            .eq("conjunto_id", conjunto.id);

          if (itensData) {
            // Calcular preços individuais e economia
            let precoTotalIndividual = 0;
            const itensDetalhados = itensData.map((item: { produto_nome: string; quantidade: number }) => {
              const produto = produtos.find(p => p.nome === item.produto_nome);
              const precoUnitario = produto?.preco || 0;
              const precoTotalItem = precoUnitario * item.quantidade;
              precoTotalIndividual += precoTotalItem;
              
              return {
                produto_nome: item.produto_nome,
                quantidade: item.quantidade,
                preco_unitario: precoUnitario,
                preco_total_individual: precoTotalItem,
              };
            });

            const economia = Math.max(0, precoTotalIndividual - conjunto.preco_promocional);

            conjuntosCompletos.push({
              ...conjunto,
              itens: itensData.map((item: { produto_nome: string; quantidade: number }) => ({
                produto_nome: item.produto_nome,
                quantidade: item.quantidade,
              })),
              itens_detalhados: itensDetalhados,
              preco_total_individual: precoTotalIndividual,
              economia: economia,
            });
          } else {
            // Se não há itens, adicionar com valores zerados
            conjuntosCompletos.push({
              ...conjunto,
              itens: [],
              itens_detalhados: [],
              preco_total_individual: 0,
              economia: 0,
            });
          }
        }

        setConjuntos(conjuntosCompletos);
      }
    } catch (error) {
      console.error("Erro ao buscar conjuntos:", error);
      setToast({ type: 'error', message: 'Erro ao carregar conjuntos!' });
    } finally {
      setLoading(false);
      setLoadingData(false);
    }
  };

  const salvarConjunto = async () => {
    if (!form.nome || form.itens.length === 0 || !form.itens.some(item => item.produto_nome) || form.preco_promocional <= 0) {
      setToast({ type: 'error', message: 'Preencha todos os campos obrigatórios!' });
      return;
    }

    setLoading(true);
    try {
      let conjuntoId: number;

      if (editando) {
        // Atualizar conjunto existente
        const { error: updateError } = await supabase
          .from("conjuntos")
          .update({
            nome: form.nome,
            descricao: form.descricao,
            preco_promocional: form.preco_promocional,
          })
          .eq("id", editando);

        if (updateError) throw updateError;

        // Remover itens antigos
        await supabase.from("conjunto_itens").delete().eq("conjunto_id", editando);
        conjuntoId = editando;
      } else {
        // Criar novo conjunto
        const { data: maxNumeroData } = await supabase
          .from("conjuntos")
          .select("numero")
          .order("numero", { ascending: false })
          .limit(1);

        const nextNumero = (maxNumeroData && maxNumeroData[0]?.numero ? Number(maxNumeroData[0].numero) : 0) + 1;

        const { data: conjuntoData, error: insertError } = await supabase
          .from("conjuntos")
          .insert([{
            numero: nextNumero,
            nome: form.nome,
            descricao: form.descricao,
            preco_promocional: form.preco_promocional,
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        conjuntoId = conjuntoData.id;
      }

      // Inserir itens do conjunto
      const itensParaInserir = form.itens
        .filter(item => item.produto_nome)
        .map(item => ({
          conjunto_id: conjuntoId,
          produto_nome: item.produto_nome,
          quantidade: item.quantidade,
        }));

      if (itensParaInserir.length > 0) {
        const { error: itensError } = await supabase
          .from("conjunto_itens")
          .insert(itensParaInserir);

        if (itensError) throw itensError;
      }

      // Resetar formulário
      setForm({
        nome: "",
        descricao: "",
        preco_promocional: 0,
        itens: [{ produto_nome: "", quantidade: 1 }]
      });
      setEditando(null);

      setToast({ 
        type: 'success', 
        message: editando ? 'Conjunto atualizado com sucesso!' : 'Conjunto criado com sucesso!' 
      });
      
      fetchConjuntos();
    } catch (error) {
      console.error("Erro ao salvar conjunto:", error);
      setToast({ type: 'error', message: 'Erro ao salvar conjunto!' });
    } finally {
      setLoading(false);
    }
  };

  const editarConjunto = (conjunto: ConjuntoCompleto) => {
    setForm({
      nome: conjunto.nome,
      descricao: conjunto.descricao || "",
      preco_promocional: conjunto.preco_promocional,
      itens: conjunto.itens.length > 0 ? conjunto.itens : [{ produto_nome: "", quantidade: 1 }]
    });
    setEditando(conjunto.id!);
  };

  const cancelarEdicao = () => {
    setForm({
      nome: "",
      descricao: "",
      preco_promocional: 0,
      itens: [{ produto_nome: "", quantidade: 1 }]
    });
    setEditando(null);
  };

  const excluirConjunto = (id: number) => {
    setConfirmDelete({ open: true, id });
  };

  const confirmarExclusao = async () => {
    if (!confirmDelete.id) return;

    try {
      const { error } = await supabase
        .from("conjuntos")
        .delete()
        .eq("id", confirmDelete.id);

      if (error) throw error;

      setToast({ type: 'success', message: 'Conjunto excluído com sucesso!' });
      fetchConjuntos();
    } catch (error) {
      console.error("Erro ao excluir conjunto:", error);
      setToast({ type: 'error', message: 'Erro ao excluir conjunto!' });
    } finally {
      setConfirmDelete({ open: false, id: null });
    }
  };

  const toggleAtivoConjunto = async (id: number, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from("conjuntos")
        .update({ ativo })
        .eq("id", id);

      if (error) throw error;

      setToast({ 
        type: 'success', 
        message: `Conjunto ${ativo ? 'ativado' : 'desativado'} com sucesso!` 
      });
      fetchConjuntos();
    } catch (error) {
      console.error("Erro ao alterar status do conjunto:", error);
      setToast({ type: 'error', message: 'Erro ao alterar status do conjunto!' });
    }
  };

  if (!isAdmin) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-[rgb(26,34,49)]">
      <Header />
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmModal
        open={confirmDelete.open}
        onConfirm={confirmarExclusao}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
        message="Tem certeza que deseja excluir este conjunto? Esta ação não pode ser desfeita."
      />
      
      <main className="p-2 sm:p-4 max-w-7xl mx-auto">
        <div className="bg-[rgb(26,34,49)] text-white rounded-lg shadow-lg mt-0 mb-4 p-6">
          <PainelAdminButton />
          
          <div className="flex justify-center mb-1 mt-6">
            <SectionTitle className="text-3xl flex items-center gap-3 mt-4">
              🎁 Gestão de Conjuntos
            </SectionTitle>
          </div>

          <div className="mb-6 text-center text-gray-300">
            <p>Crie conjuntos de produtos com preços promocionais para oferecer descontos especiais aos clientes.</p>
          </div>

          <ConjuntoForm
            form={form}
            setForm={setForm}
            produtos={produtos}
            onSubmit={salvarConjunto}
            loading={loading}
            isEditing={!!editando}
            onCancelEdit={cancelarEdicao}
          />

          <div className="mt-8">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Conjuntos Criados</h2>
              <div className="flex gap-3 items-center">
                <SearchInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, descrição ou produtos..."
                />
                <RefreshButton onClick={fetchConjuntos} loading={loading} />
              </div>
            </div>

            <ConjuntoList
              conjuntos={conjuntos}
              search={search}
              onEditar={editarConjunto}
              onExcluir={excluirConjunto}
              onToggleAtivo={toggleAtivoConjunto}
            />
            
            {loadingData && (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  Carregando valores dos conjuntos...
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
