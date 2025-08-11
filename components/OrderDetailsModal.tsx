import React, { useState, useEffect, useCallback } from "react";
import OrderMaterialsList from "./OrderMaterialsList";
import { Pedido } from "../types/Pedido";
import { formatDateBR } from "../lib/formatDate";
import { FaFilePdf, FaUndo } from "react-icons/fa";
import { pdf } from "@react-pdf/renderer";
import PedidoPDF from "./PedidoPDF";
import { FaEdit, FaTrash } from "react-icons/fa";
import { formatTelefoneBR } from "@/lib/formatNumber";
import { formatCpfCnpjBR } from "@/lib/formatCpfCnpj";
import DevolucaoModal from "./DevolucaoModal";
import { supabase } from "../lib/supabaseClient";
import { formatarMoedaDeCentavos } from "../lib/currencyUtils";

interface Props {
  pedido: Pedido | null;
  open: boolean;
  onClose: () => void;
  onEditar?: (pedido: Pedido) => void;
  onExcluir?: (id: number) => void;
  onDevolucao?: (pedido: Pedido, itensDevolvidos: { nome: string; quantidade: number; devolucao_atual: number }[], observacoes: string) => void;
}

const OrderDetailsModal: React.FC<Props> = ({ pedido, open, onClose, onEditar, onExcluir, onDevolucao }) => {
  const [devolucaoModalOpen, setDevolucaoModalOpen] = useState(false);
  const [pedidoAtualizado, setPedidoAtualizado] = useState<Pedido | null>(pedido);
  
  const carregarDevolucoes = useCallback(async () => {
    if (!pedido?.numero) return;

    try {
      // Buscar devoluções realizadas para este pedido
      const { data: devolucoes, error } = await supabase
        .from("devolucoes")
        .select("nome_produto, quantidade_devolvida")
        .eq("numero_pedido", pedido.numero);

      if (error) {
        console.error("Erro ao carregar devoluções:", error);
        setPedidoAtualizado(pedido);
        return;
      }

      // Agregar quantidades devolvidas por produto
      const devolucoesAgregadas = devolucoes?.reduce((acc, dev) => {
        acc[dev.nome_produto] = (acc[dev.nome_produto] || 0) + dev.quantidade_devolvida;
        return acc;
      }, {} as Record<string, number>) || {};

      // Atualizar materiais com quantidades devolvidas
      const materiaisAtualizados = pedido.materiais.map(material => ({
        ...material,
        quantidade_devolvida: devolucoesAgregadas[material.nome] || 0
      }));

      setPedidoAtualizado({
        ...pedido,
        materiais: materiaisAtualizados
      });
    } catch (error) {
      console.error("Erro ao carregar devoluções:", error);
      setPedidoAtualizado(pedido);
    }
  }, [pedido]);

  useEffect(() => {
    if (pedido && open) {
      carregarDevolucoes();
    }
  }, [pedido, open, carregarDevolucoes]);
  
  if (!pedidoAtualizado) return null;

  const handleDevolucao = (itensDevolvidos: { nome: string; quantidade: number; devolucao_atual: number }[], observacoes: string) => {
    if (onDevolucao && pedidoAtualizado) {
      onDevolucao(pedidoAtualizado, itensDevolvidos, observacoes);
      // Recarregar devoluções após a operação
      setTimeout(() => carregarDevolucoes(), 500);
    }
  };

  // Verificar se há itens pendentes de devolução
  const temItensPendentes = pedidoAtualizado.materiais.some(item => 
    (item.quantidade_devolvida || 0) < item.quantidade
  );

  const handleDownloadPDF = async () => {
    const blob = await pdf(
      <PedidoPDF pedido={{
        ...pedidoAtualizado,
        telefone: pedidoAtualizado.telefone || "",
        residencial: pedidoAtualizado.residencial || "",
        referencia: pedidoAtualizado.referencia || "",
        endereco: pedidoAtualizado.endereco || "",
        cpf: pedidoAtualizado.cpf || "",
        data_devolucao: pedidoAtualizado.data_devolucao || "",
        data_evento: pedidoAtualizado.data_evento || "",
        data_locacao: pedidoAtualizado.data_locacao || "",
        cliente: pedidoAtualizado.cliente || "",
        numero: pedidoAtualizado.numero || 0,
        materiais: pedidoAtualizado.materiais || [],
        valor_total: pedidoAtualizado.valor_total || 0,
        valor_pago: pedidoAtualizado.valor_pago || 0,
        valor_deve: pedidoAtualizado.valor_deve || 0,
        // Campos de desconto
        desconto_tipo: pedidoAtualizado.desconto_tipo || null,
        desconto_valor: pedidoAtualizado.desconto_valor || 0,
        valor_desconto: pedidoAtualizado.valor_desconto || 0,
        valor_final: pedidoAtualizado.valor_final || 0,
        // Campos de responsabilidades
        resp_entregou: pedidoAtualizado.resp_entregou || "",
        data_entregou: pedidoAtualizado.data_entregou || "",
        hora_entregou: pedidoAtualizado.hora_entregou || "",
        resp_recebeu: pedidoAtualizado.resp_recebeu || "",
        data_recebeu: pedidoAtualizado.data_recebeu || "",
        hora_recebeu: pedidoAtualizado.hora_recebeu || "",
        resp_buscou: pedidoAtualizado.resp_buscou || "",
        data_buscou: pedidoAtualizado.data_buscou || "",
        hora_buscou: pedidoAtualizado.hora_buscou || "",
        resp_forro: pedidoAtualizado.resp_forro || "",
        data_forro: pedidoAtualizado.data_forro || "",
        hora_forro: pedidoAtualizado.hora_forro || "",
        resp_utensilio: pedidoAtualizado.resp_utensilio || "",
        data_utensilio: pedidoAtualizado.data_utensilio || "",
        hora_utensilio: pedidoAtualizado.hora_utensilio || "",
        obs: pedidoAtualizado.obs || "",
      }} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Pedido_${pedidoAtualizado.numero || pedidoAtualizado.cliente}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 ${open ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fixo */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800">
          <h2 className="text-xl md:text-2xl font-bold text-white">Detalhes do Pedido - Pedido #{pedidoAtualizado.numero}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-3xl transition-colors duration-200">&times;</button>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-2 p-6 border-b border-gray-700 bg-gray-800">
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-3 text-sm flex items-center gap-2 transition-colors duration-200"
            onClick={handleDownloadPDF}
          >
            <FaFilePdf className="text-red-400" /> Salvar PDF
          </button>
          {temItensPendentes && onDevolucao && (
            <button
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-4 py-3 text-sm flex items-center gap-2 transition-colors duration-200"
              onClick={() => setDevolucaoModalOpen(true)}
            >
              <FaUndo /> Registrar Devolução
            </button>
          )}
          {onEditar && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 text-sm flex items-center gap-2 transition-colors duration-200"
              onClick={() => { onClose(); onEditar(pedidoAtualizado); }}
            >
              <FaEdit /> Editar
            </button>
          )}
          {onExcluir && pedidoAtualizado.numero && (
            <button
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-3 text-sm flex items-center gap-2 transition-colors duration-200"
              onClick={() => { onClose(); onExcluir(Number(pedidoAtualizado.numero)); }}
            >
              <FaTrash /> Excluir
            </button>
          )}
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Informações básicas do pedido */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📋 Informações do Pedido
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Número</span>
                <p className="text-white font-semibold text-lg">{pedidoAtualizado.numero}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Data Locação</span>
                <p className="text-white font-semibold">{formatDateBR(pedidoAtualizado.data_locacao)}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Data Evento</span>
                <p className="text-white font-semibold">{formatDateBR(pedidoAtualizado.data_evento)}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Data Devolução</span>
                <p className="text-white font-semibold">{formatDateBR(pedidoAtualizado.data_devolucao)}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Cliente</span>
                <p className="text-white font-semibold">{pedidoAtualizado.cliente}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">CPF/CNPJ</span>
                <p className="text-white font-semibold">{formatCpfCnpjBR(pedidoAtualizado.cpf)}</p>
              </div>
            </div>
          </div>

          {/* Informações de contato e endereço */}
          <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📍 Contato & Endereço
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Telefone</span>
                <p className="text-white font-semibold">{formatTelefoneBR(pedidoAtualizado.telefone) || '-'}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Pagamento</span>
                <p className="text-white font-semibold">{pedidoAtualizado.pagamento || '-'}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg sm:col-span-2">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Endereço do Evento</span>
                <p className="text-white font-semibold">{pedidoAtualizado.endereco || '-'}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg sm:col-span-2">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Endereço Residencial</span>
                <p className="text-white font-semibold">{pedidoAtualizado.residencial || '-'}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg sm:col-span-2">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Referência</span>
                <p className="text-white font-semibold">{pedidoAtualizado.referencia || '-'}</p>
              </div>
            </div>
          </div>

          {/* Valores financeiros */}
          <div className="bg-gradient-to-r from-yellow-900/20 to-green-900/20 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              💰 Valores
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                <span className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Valor Bruto</span>
                <p className="text-blue-400 font-bold text-xl">
                  {formatarMoedaDeCentavos(pedidoAtualizado.valor_total || 0)}
                </p>
              </div>
              
              {/* Mostrar desconto se houver */}
              {pedidoAtualizado.desconto_tipo && pedidoAtualizado.valor_desconto && pedidoAtualizado.valor_desconto > 0 && (
                <>
                  <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                    <span className="text-gray-400 text-xs uppercase tracking-wide block mb-2">
                      Desconto ({pedidoAtualizado.desconto_tipo === 'porcentagem' 
                        ? `${pedidoAtualizado.desconto_valor}%` 
                        : 'Valor Fixo'})
                    </span>
                    <p className="text-red-400 font-bold text-xl">
                      - {formatarMoedaDeCentavos(pedidoAtualizado.valor_desconto || 0)}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                    <span className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Valor Final</span>
                    <p className="text-green-400 font-bold text-xl">
                      {formatarMoedaDeCentavos(pedidoAtualizado.valor_final || 0)}
                    </p>
                  </div>
                </>
              )}
              
              <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                <span className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Valor Pago</span>
                <p className="text-green-400 font-bold text-xl">
                  {formatarMoedaDeCentavos(pedidoAtualizado.valor_pago || 0)}
                </p>
              </div>
            </div>
            
            {/* Valor a pagar - linha separada para dar destaque */}
            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                <span className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Valor a Pagar</span>
                <p className={`font-bold text-2xl ${(pedidoAtualizado.valor_deve || 0) > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {formatarMoedaDeCentavos(pedidoAtualizado.valor_deve || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Seção de Responsabilidades */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              👥 Responsabilidades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Entrega */}
              <div className="bg-gradient-to-br from-blue-800/30 to-blue-900/30 p-4 rounded-lg border border-blue-700/30">
                <h4 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
                  🚚 Entrega
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Responsável:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.resp_entregou || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.data_entregou ? formatDateBR(pedidoAtualizado.data_entregou) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hora:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.hora_entregou || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Recebimento
              <div className="bg-gradient-to-br from-green-800/30 to-green-900/30 p-4 rounded-lg border border-green-700/30">
                <h4 className="font-medium text-green-300 mb-3 flex items-center gap-2">
                  📦 Recebimento
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Responsável:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.resp_recebeu || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.data_recebeu ? formatDateBR(pedidoAtualizado.data_recebeu) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hora:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.hora_recebeu || '-'}</span>
                  </div>
                </div>
              </div> */}

              {/* Busca */}
              <div className="bg-gradient-to-br from-yellow-800/30 to-yellow-900/30 p-4 rounded-lg border border-yellow-700/30">
                <h4 className="font-medium text-yellow-300 mb-3 flex items-center gap-2">
                  🔍 Busca
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Responsável:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.resp_buscou || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.data_buscou ? formatDateBR(pedidoAtualizado.data_buscou) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hora:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.hora_buscou || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Conferência de Forro */}
              <div className="bg-gradient-to-br from-purple-800/30 to-purple-900/30 p-4 rounded-lg border border-purple-700/30">
                <h4 className="font-medium text-purple-300 mb-3 flex items-center gap-2">
                  🏠 Conferência de Forro
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Responsável:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.resp_forro || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.data_forro ? formatDateBR(pedidoAtualizado.data_forro) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hora:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.hora_forro || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Conferência de Utensílios */}
              <div className="bg-gradient-to-br from-orange-800/30 to-orange-900/30 p-4 rounded-lg border border-orange-700/30 md:col-span-3">
                <h4 className="font-medium text-orange-300 mb-3 flex items-center gap-2">
                  🍽️ Conferência de Utensílios
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-400 sm:block">Responsável:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.resp_utensilio || '-'}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-400 sm:block">Data:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.data_utensilio ? formatDateBR(pedidoAtualizado.data_utensilio) : '-'}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-400 sm:block">Hora:</span>
                    <span className="text-white font-medium">{pedidoAtualizado.hora_utensilio || '-'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Observações */}
          {pedidoAtualizado.obs && (
            <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                📝 Observações
              </h3>
              <div className="bg-gray-700/50 p-4 rounded-lg overflow-hidden">
                <p className="text-white leading-relaxed whitespace-pre-wrap break-words overflow-wrap-break-word"
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: '100%',
                    wordBreak: 'break-all'
                  }}>
                  {pedidoAtualizado.obs}
                </p>
              </div>
            </div>
          )}

          {/* Informações de Devolução */}
          {(pedidoAtualizado.data_devolucao_realizada || pedidoAtualizado.responsavel_devolucao || pedidoAtualizado.observacoes_devolucao) && (
            <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                🔄 Informações de Devolução
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {pedidoAtualizado.data_devolucao_realizada && (
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <span className="text-gray-400 text-xs uppercase tracking-wide">Data da Devolução</span>
                    <p className="text-white font-semibold">{formatDateBR(pedidoAtualizado.data_devolucao_realizada)}</p>
                  </div>
                )}
                {pedidoAtualizado.responsavel_devolucao && (
                  <div className="bg-gray-700/50 p-3 rounded-lg">
                    <span className="text-gray-400 text-xs uppercase tracking-wide">Responsável</span>
                    <p className="text-white font-semibold">{pedidoAtualizado.responsavel_devolucao}</p>
                  </div>
                )}
                {pedidoAtualizado.observacoes_devolucao && (
                  <div className="bg-gray-700/50 p-3 rounded-lg sm:col-span-3">
                    <span className="text-gray-400 text-xs uppercase tracking-wide">Observações da Devolução</span>
                    <p className="text-white font-semibold">{pedidoAtualizado.observacoes_devolucao}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Materiais */}
          <div className="bg-gradient-to-r from-gray-900/50 to-slate-900/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📋 Materiais
            </h3>
            <OrderMaterialsList materiais={pedidoAtualizado.materiais} />
          </div>

        </div>
      </div>

      {/* Modal de Devolução */}
      <DevolucaoModal
        pedido={pedidoAtualizado}
        open={devolucaoModalOpen}
        onClose={() => setDevolucaoModalOpen(false)}
        onConfirmarDevolucao={handleDevolucao}
      />
    </div>
  );
};

export default OrderDetailsModal;