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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${open ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <div className="bg-gray-800 rounded-lg shadow-lg max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Detalhes do Pedido</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600 text-2xl">&times;</button>
        </div>
        <div className="flex gap-2 mb-4">
          <button
            className="bg-gray-700 text-white rounded px-4 py-4 text-sm flex items-center gap-1"
            onClick={handleDownloadPDF}
          >
            <FaFilePdf /> Salvar como PDF
          </button>
          {onEditar && (
            <button
              className="bg-blue-600 text-white rounded px-4 py-3 text-sm flex items-center gap-1"
              onClick={() => { onClose(); onEditar(pedido); }}
            >
              <FaEdit /> Editar
            </button>
          )}
          {onExcluir && pedido.numero && (
            <button
              className="bg-red-600 text-white rounded px-4 py-3 text-sm flex items-center gap-1"
              onClick={() => { onClose(); onExcluir(Number(pedido.numero)); }}
            >
              <FaTrash /> Excluir
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white">
          <div><b>Nº:</b> {pedido.numero}</div>
          <div><b>Data Locação:</b> {formatDateBR(pedido.data_locacao)}</div>
          <div><b>Data Evento:</b> {formatDateBR(pedido.data_evento)}</div>
          <div><b>Data Devolução:</b> {formatDateBR(pedido.data_devolucao)}</div>
          <div><b>Cliente:</b> {pedido.cliente}</div>
          <div><b>CPF/CNPJ:</b> {formatCpfCnpjBR(pedido.cpf)}</div>
          <div><b>Telefone:</b> {formatTelefoneBR(pedido.telefone)}</div>
          <div><b>Endereço Evento:</b> {pedido.endereco}</div>
          <div><b>Endereço Residencial:</b> {pedido.residencial}</div>
          <div><b>Referência:</b> {pedido.referencia}</div>
          <div><b>Pagamento:</b> {pedido.pagamento}</div>
          <div><b>Valor Total:</b> {pedido.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          <div><b>Valor Pago:</b> <span className="text-green-400">{pedido.valor_pago?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}</span></div>
          <div><b>Valor a Pagar:</b> <span className={(pedido.valor_deve || 0) > 0 ? 'text-red-400' : 'text-gray-400'}>{pedido.valor_deve?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}</span></div>
        </div>
        <div className="mt-4 border-t">
          <h3 className="font-semibold mb-2 mt-4">Materiais</h3>
          <OrderMaterialsList materiais={pedido.materiais} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
