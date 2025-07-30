import React from "react";
import OrderMaterialsList from "./OrderMaterialsList";
import { Pedido } from "../types/Pedido";
import { formatDateBR } from "../lib/formatDate";
import { FaFilePdf } from "react-icons/fa";
import { pdf } from "@react-pdf/renderer";
import PedidoPDF from "./PedidoPDF";
import { FaEdit, FaTrash } from "react-icons/fa";
import { formatTelefoneBR } from "@/lib/formatNumber";
import { formatCpfCnpjBR } from "@/lib/formatCpfCnpj";

interface Props {
  pedido: Pedido | null;
  open: boolean;
  onClose: () => void;
  onEditar?: (pedido: Pedido) => void;
  onExcluir?: (id: number) => void;
}

const OrderDetailsModal: React.FC<Props> = ({ pedido, open, onClose, onEditar, onExcluir }) => {
  if (!pedido) return null;

  const handleDownloadPDF = async () => {
    const blob = await pdf(
      <PedidoPDF pedido={{
        ...pedido,
        telefone: pedido.telefone || "",
        residencial: pedido.residencial || "",
        referencia: pedido.referencia || "",
        endereco: pedido.endereco || "",
        cpf: pedido.cpf || "",
        data_devolucao: pedido.data_devolucao || "",
        data_evento: pedido.data_evento || "",
        cliente: pedido.cliente || "",
        numero: pedido.numero || "",
        materiais: pedido.materiais || [],
        valor_total: pedido.valor_total || 0,
        valor_pago: pedido.valor_pago || 0,
        valor_deve: pedido.valor_deve || 0,
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
      }} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Pedido_${pedido.numero || pedido.cliente}.pdf`;
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
          <h2 className="text-xl md:text-2xl font-bold text-white">Detalhes do Pedido</h2>
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
          {onEditar && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 text-sm flex items-center gap-2 transition-colors duration-200"
              onClick={() => { onClose(); onEditar(pedido); }}
            >
              <FaEdit /> Editar
            </button>
          )}
          {onExcluir && pedido.numero && (
            <button
              className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-3 text-sm flex items-center gap-2 transition-colors duration-200"
              onClick={() => { onClose(); onExcluir(Number(pedido.numero)); }}
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
                <p className="text-white font-semibold text-lg">{pedido.numero}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Data Locação</span>
                <p className="text-white font-semibold">{formatDateBR(pedido.data_locacao)}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Data Evento</span>
                <p className="text-white font-semibold">{formatDateBR(pedido.data_evento)}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Data Devolução</span>
                <p className="text-white font-semibold">{formatDateBR(pedido.data_devolucao)}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Cliente</span>
                <p className="text-white font-semibold">{pedido.cliente}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">CPF/CNPJ</span>
                <p className="text-white font-semibold">{formatCpfCnpjBR(pedido.cpf)}</p>
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
                <p className="text-white font-semibold">{formatTelefoneBR(pedido.telefone) || '-'}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Pagamento</span>
                <p className="text-white font-semibold">{pedido.pagamento || '-'}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg sm:col-span-2">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Endereço do Evento</span>
                <p className="text-white font-semibold">{pedido.endereco || '-'}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg sm:col-span-2">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Endereço Residencial</span>
                <p className="text-white font-semibold">{pedido.residencial || '-'}</p>
              </div>
              <div className="bg-gray-700/50 p-3 rounded-lg sm:col-span-2">
                <span className="text-gray-400 text-xs uppercase tracking-wide">Referência</span>
                <p className="text-white font-semibold">{pedido.referencia || '-'}</p>
              </div>
            </div>
          </div>

          {/* Valores financeiros */}
          <div className="bg-gradient-to-r from-yellow-900/20 to-green-900/20 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              💰 Valores
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                <span className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Valor Total</span>
                <p className="text-blue-400 font-bold text-xl">
                  {pedido.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                <span className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Valor Pago</span>
                <p className="text-green-400 font-bold text-xl">
                  {pedido.valor_pago?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                </p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                <span className="text-gray-400 text-xs uppercase tracking-wide block mb-2">Valor a Pagar</span>
                <p className={`font-bold text-xl ${(pedido.valor_deve || 0) > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {pedido.valor_deve?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                </p>
              </div>
            </div>
          </div>

          {/* Seção de Responsabilidades */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              👥 Responsabilidades
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Entrega */}
              <div className="bg-gradient-to-br from-blue-800/30 to-blue-900/30 p-4 rounded-lg border border-blue-700/30">
                <h4 className="font-medium text-blue-300 mb-3 flex items-center gap-2">
                  🚚 Entrega
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Responsável:</span>
                    <span className="text-white font-medium">{pedido.resp_entregou || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white font-medium">{pedido.data_entregou ? formatDateBR(pedido.data_entregou) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hora:</span>
                    <span className="text-white font-medium">{pedido.hora_entregou || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Recebimento */}
              <div className="bg-gradient-to-br from-green-800/30 to-green-900/30 p-4 rounded-lg border border-green-700/30">
                <h4 className="font-medium text-green-300 mb-3 flex items-center gap-2">
                  📦 Recebimento
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Responsável:</span>
                    <span className="text-white font-medium">{pedido.resp_recebeu || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white font-medium">{pedido.data_recebeu ? formatDateBR(pedido.data_recebeu) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hora:</span>
                    <span className="text-white font-medium">{pedido.hora_recebeu || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Busca */}
              <div className="bg-gradient-to-br from-yellow-800/30 to-yellow-900/30 p-4 rounded-lg border border-yellow-700/30">
                <h4 className="font-medium text-yellow-300 mb-3 flex items-center gap-2">
                  🔍 Busca
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Responsável:</span>
                    <span className="text-white font-medium">{pedido.resp_buscou || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white font-medium">{pedido.data_buscou ? formatDateBR(pedido.data_buscou) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hora:</span>
                    <span className="text-white font-medium">{pedido.hora_buscou || '-'}</span>
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
                    <span className="text-white font-medium">{pedido.resp_forro || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Data:</span>
                    <span className="text-white font-medium">{pedido.data_forro ? formatDateBR(pedido.data_forro) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hora:</span>
                    <span className="text-white font-medium">{pedido.hora_forro || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Conferência de Utensílios */}
              <div className="bg-gradient-to-br from-orange-800/30 to-orange-900/30 p-4 rounded-lg border border-orange-700/30 md:col-span-2">
                <h4 className="font-medium text-orange-300 mb-3 flex items-center gap-2">
                  🍽️ Conferência de Utensílios
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-400 sm:block">Responsável:</span>
                    <span className="text-white font-medium">{pedido.resp_utensilio || '-'}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-400 sm:block">Data:</span>
                    <span className="text-white font-medium">{pedido.data_utensilio ? formatDateBR(pedido.data_utensilio) : '-'}</span>
                  </div>
                  <div className="flex justify-between sm:block">
                    <span className="text-gray-400 sm:block">Hora:</span>
                    <span className="text-white font-medium">{pedido.hora_utensilio || '-'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Materiais */}
          <div className="bg-gradient-to-r from-gray-900/50 to-slate-900/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📋 Materiais
            </h3>
            <OrderMaterialsList materiais={pedido.materiais} />
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;