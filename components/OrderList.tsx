import React, { useState } from "react";
import { FaTrash, FaEdit, FaFilePdf, FaEye } from "react-icons/fa";
import OrderDetailsModal from "./OrderDetailsModal";
import { Pedido } from "../types/Pedido";
import { pdf } from "@react-pdf/renderer";
import PedidoPDF from "./PedidoPDF";
import { formatDateBR } from "../lib/formatDate";

interface Material {
  nome: string;
  quantidade: number;
  valor_unit: number;
  valor_total: number;
}

interface OrderListProps {
  pedidos: (Pedido & { materiais: Material[] })[];
  search: string;
  onEditar?: (pedido: Pedido & { materiais: Material[] }) => void;
  onExcluir?: (id: string) => void;
  onExportarPDF?: (pedido: Pedido & { materiais: Material[] }) => void;
}

const OrderList: React.FC<OrderListProps> = ({ pedidos, search, onEditar, onExcluir }) => {
  const [modalPedido, setModalPedido] = useState<Pedido | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleVerMais = (pedido: Pedido) => {
    setModalPedido(pedido);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalPedido(null);
  };

  const handleDownloadPDF = async (pedido: Pedido) => {
    const blob = await pdf(
      <PedidoPDF pedido={{
        ...pedido,
        responsavel_entregou: pedido.responsavel_entregou || "",
        data_entregou: pedido.data_entregou || "",
        responsavel_recebeu: pedido.responsavel_recebeu || "",
        data_recebeu: pedido.data_recebeu || "",
        responsavel_buscou: pedido.responsavel_buscou || "",
        data_buscou: pedido.data_buscou || "",
        responsavel_conferiu_forro: pedido.responsavel_conferiu_forro || "",
        responsavel_conferiu_utensilio: pedido.responsavel_conferiu_utensilio || "",
        assinatura: pedido.assinatura || "",
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
        desconto: pedido.desconto || 0,
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

  const pedidosFiltrados = pedidos.filter((p) =>
    p.cliente.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs bg-gray-900 rounded">
        <thead>
          <tr className="bg-gray-700">
            <th className="p-2">Nº</th>
            <th className="p-2">Cliente</th>
            <th className="p-2">Data Locação</th>
            <th className="p-2">Data Evento</th>
            <th className="p-2">Local do Evento</th>
            <th className="p-2">Total</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidosFiltrados.map((p, idx) => (
            <tr key={p.id || p.numero || idx} className="border-b border-gray-800">
              <td className="p-2">{p.numero}</td>
              <td className="p-2">{p.cliente}</td>
              <td className="p-2">{formatDateBR(p.data_locacao)}</td>
              <td className="p-2">{formatDateBR(p.data_evento) || '-'}</td>
              <td className="p-2">{p.endereco || '-'}</td>
              <td className="p-2">R$ {p.valor_total?.toFixed(2)}</td>
              <td className="p-2">
                <div className="flex gap-1 flex-wrap">
                  <button className="bg-gray-700 text-white rounded px-2 py-1 text-xs flex items-center gap-1" title="Exportar PDF" onClick={() => handleDownloadPDF(p)}>
                    <FaFilePdf /> PDF
                  </button>
                  <button className="bg-gray-600 text-white rounded px-2 py-1 text-xs flex items-center gap-1" onClick={() => handleVerMais(p)} title="Ver mais">
                    <FaEye /> Ver mais
                  </button>
                  {onEditar && (
                    <button key="edit" className="bg-blue-600 text-white rounded px-2 py-1 text-xs flex items-center gap-1" onClick={() => onEditar(p)} title="Editar">
                      <FaEdit /> Editar
                    </button>
                  )}
                  {onExcluir && p.id && (
                    <button key="delete" className="bg-red-600 text-white rounded px-2 py-1 text-xs flex items-center gap-1" onClick={() => onExcluir(String(p.id))} title="Excluir">
                      <FaTrash /> Excluir
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <OrderDetailsModal pedido={modalPedido} open={modalOpen} onClose={handleCloseModal} />
    </div>
  );
};

export default OrderList;
