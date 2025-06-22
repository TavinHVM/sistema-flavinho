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
        {materiais.map((mat, idx) => (
          <tr key={idx}>
            <td className="border px-2 py-1 text-center">{mat.quantidade}</td>
            <td className="border px-2 py-1">{mat.nome}</td>
            <td className="border px-2 py-1 text-right">R$ {mat.valor_unit?.toFixed(2)}</td>
            <td className="border px-2 py-1 text-right">R$ {mat.valor_total?.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderMaterialsList;
