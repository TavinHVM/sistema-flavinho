import React from "react";
import { PedidoItem } from "../types/Pedido";

interface Props {
  materiais: PedidoItem[];
}

const OrderMaterialsList: React.FC<Props> = ({ materiais }) => {
  return (
    <table className="min-w-full text-xs border border-gray-800">
      <thead>
        <tr className="bg-gray-700">
          <th className="border px-2 py-1">Quant.</th>
          <th className="border px-2 py-1">Material</th>
          <th className="border px-2 py-1">Valor Unit.</th>
          <th className="border px-2 py-1">Valor Total</th>
        </tr>
      </thead>
      <tbody>
        {(materiais || []).map((mat, idx) => (
          <tr key={mat.nome + '-' + idx}>
            <td className="border px-2 py-1 text-center">{mat.quantidade}</td>
            <td className="border px-2 py-1">{mat.nome}</td>
            <td className="border px-2 py-1 text-right">
              {mat.valor_unit?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </td>
            <td className="border px-2 py-1 text-right">
              {mat.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderMaterialsList;
