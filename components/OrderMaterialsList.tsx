import React from "react";
import { PedidoItem } from "../types/Pedido";
import { formatarMoedaDeCentavos } from "../lib/currencyUtils";

interface Props {
  materiais: PedidoItem[];
}

const OrderMaterialsList: React.FC<Props> = ({ materiais }) => {
  return (
    <div className="overflow-x-auto">
      <div className="max-h-[600px] overflow-y-auto border border-gray-800 rounded-lg">
        <table className="min-w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-700">
              <th className="border px-2 py-1">Material</th>
              <th className="border px-2 py-1">Alugado</th>
              <th className="border px-2 py-1">Devolvido</th>
              <th className="border px-2 py-1">Pendente</th>
              <th className="border px-2 py-1">Valor Unit.</th>
              <th className="border px-2 py-1">Valor Total</th>
            </tr>
          </thead>
        <tbody>
          {(materiais || []).map((mat, idx) => {
            const quantidadeDevolvida = mat.quantidade_devolvida || 0;
            const quantidadePendente = mat.quantidade - quantidadeDevolvida;
            
            return (
              <tr key={mat.nome + '-' + idx} className={quantidadePendente > 0 ? 'bg-yellow-900/20' : 'bg-green-900/20'}>
                <td className="border px-2 py-1 font-medium">{mat.nome}</td>
                <td className="border px-2 py-1 text-center font-semibold">{mat.quantidade}</td>
                <td className="border px-2 py-1 text-center">
                  <span className={quantidadeDevolvida > 0 ? 'text-green-400 font-semibold' : 'text-gray-400'}>
                    {quantidadeDevolvida}
                  </span>
                </td>
                <td className="border px-2 py-1 text-center">
                  <span className={quantidadePendente > 0 ? 'text-yellow-400 font-semibold' : 'text-green-400 font-semibold'}>
                    {quantidadePendente}
                  </span>
                </td>
                <td className="border px-2 py-1 text-right">
                  {formatarMoedaDeCentavos(mat.valor_unit || 0)}
                </td>
                <td className="border px-2 py-1 text-right">
                  {formatarMoedaDeCentavos(mat.valor_total || 0)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
      
      {/* Legenda */}
      <div className="mt-3 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span className="text-gray-300">Pendente de devolução</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span className="text-gray-300">Totalmente devolvido</span>
        </div>
      </div>
    </div>
  );
};

export default OrderMaterialsList;
