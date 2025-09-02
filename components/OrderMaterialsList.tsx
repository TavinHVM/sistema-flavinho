import React from "react";
import { PedidoItem } from "../types/Pedido";
import { formatarMoedaDeCentavos } from "../lib/currencyUtils";

interface Props {
  materiais: PedidoItem[];
}

const OrderMaterialsList: React.FC<Props> = ({ materiais }) => {
  // Função para agrupar materiais por conjunto
  const agruparMateriais = () => {
    const gruposConjuntos: { [key: string]: PedidoItem[] } = {};
    const materiaisIndividuais: PedidoItem[] = [];

    // Separar materiais por conjunto ou individuais
    materiais.forEach(material => {
      const conjuntoMatch = material.nome.match(/^\[CONJUNTO:\s*([^\]]+)\]/);
      
      if (conjuntoMatch) {
        const nomeConjunto = conjuntoMatch[1].trim();
        if (!gruposConjuntos[nomeConjunto]) {
          gruposConjuntos[nomeConjunto] = [];
        }
        gruposConjuntos[nomeConjunto].push(material);
      } else {
        materiaisIndividuais.push(material);
      }
    });

    return { gruposConjuntos, materiaisIndividuais };
  };

  const { gruposConjuntos, materiaisIndividuais } = agruparMateriais();

  return (
    <div className="overflow-x-auto">
      <div className="max-h-[600px] overflow-y-auto border border-gray-800 rounded-lg">
        <table className="min-w-full text-xs">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-700">
              <th className="border border-gray-600 px-2 py-2 w-[10%] text-white font-bold">QUANT.</th>
              <th className="border border-gray-600 px-2 py-2 w-[55%] text-white font-bold">MATERIAL</th>
              <th className="border border-gray-600 px-2 py-2 w-[17.5%] text-white font-bold">VALOR UNIT.</th>
              <th className="border border-gray-600 px-2 py-2 w-[17.5%] text-white font-bold">VALOR TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {/* Renderizar conjuntos agrupados */}
            {Object.entries(gruposConjuntos).map(([, itensConjunto], conjuntoIndex) => {
              const conjuntoColors = [
                "bg-cyan-100/80", "bg-yellow-100/80", "bg-pink-100/80", 
                "bg-green-100/80", "bg-purple-100/80", "bg-red-100/80", "bg-slate-100/80"
              ];
              const conjuntoColor = conjuntoColors[conjuntoIndex % conjuntoColors.length];
              const quantidadeConjunto = itensConjunto[0]?.quantidade || 1;
              const valorTotalConjunto = itensConjunto.reduce((total, item) => total + (item.valor_total || 0), 0);
              const valorUnitarioConjunto = Math.round(valorTotalConjunto / quantidadeConjunto);
              const n = itensConjunto.length;
              const middleIndex = Math.floor(n / 2);
              
              return itensConjunto.map((item, itemIndex) => {
                const nomeItem = item.nome.replace(/^\[CONJUNTO:\s*[^\]]+\]\s*/, '');
                const quantidadeDevolvida = item.quantidade_devolvida || 0;
                const quantidadePendente = item.quantidade - quantidadeDevolvida;
                const isPendente = quantidadePendente > 0;
                
                // Combinar cor do conjunto com indicação de pendente
                const backgroundClass = isPendente 
                  ? `${conjuntoColor} bg-gradient-to-r from-red-200/60 to-transparent`
                  : conjuntoColor;
                
                // Para número ímpar: valor no produto do meio
                if (n % 2 === 1 && itemIndex === middleIndex) {
                  return (
                    <tr key={`conjunto-${conjuntoIndex}-${itemIndex}`} 
                        className={`${backgroundClass} border-l-4 ${isPendente ? 'border-l-red-500' : 'border-l-cyan-600'}`}>
                      <td className="border border-gray-600 px-2 py-1 text-center font-bold text-cyan-700">
                        → {item.quantidade}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-left font-bold text-cyan-700">
                        {nomeItem}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-center font-bold text-cyan-700">
                        {formatarMoedaDeCentavos(valorUnitarioConjunto)}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-center font-bold text-cyan-700">
                        {formatarMoedaDeCentavos(valorTotalConjunto)}
                      </td>
                    </tr>
                  );
                } 
                // Para número par: valor no primeiro produto central
                else if (n % 2 === 0 && itemIndex === middleIndex - 1) {
                  return (
                    <tr key={`conjunto-${conjuntoIndex}-${itemIndex}`} 
                        className={`${backgroundClass} border-l-4 ${isPendente ? 'border-l-red-500' : 'border-l-cyan-600'}`}>
                      <td className="border border-gray-600 px-2 py-1 text-center font-bold text-cyan-700">
                        → {item.quantidade}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-left font-bold text-cyan-700">
                        {nomeItem}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-center font-bold text-cyan-700">
                        {formatarMoedaDeCentavos(valorUnitarioConjunto)}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-center font-bold text-cyan-700">
                        {formatarMoedaDeCentavos(valorTotalConjunto)}
                      </td>
                    </tr>
                  );
                }
                // Demais produtos do conjunto (sem valor)
                else {
                  return (
                    <tr key={`conjunto-${conjuntoIndex}-${itemIndex}`} 
                        className={`${backgroundClass} border-l-4 ${isPendente ? 'border-l-red-500' : 'border-l-cyan-600'}`}>
                      <td className="border border-gray-600 px-2 py-1 text-center text-cyan-700">
                        → {item.quantidade}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-left text-cyan-700">
                        {nomeItem}
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-center text-cyan-700">
                        -
                      </td>
                      <td className="border border-gray-600 px-2 py-1 text-center text-cyan-700">
                        -
                      </td>
                    </tr>
                  );
                }
              });
            })}
            
            {/* Renderizar materiais individuais */}
            {materiaisIndividuais.map((mat, i) => {
              const quantidadeDevolvida = mat.quantidade_devolvida || 0;
              const quantidadePendente = mat.quantidade - quantidadeDevolvida;
              const isPendente = quantidadePendente > 0;
              const isEven = i % 2 === 0;
              
              // Background com indicação de pendente
              const backgroundClass = isPendente 
                ? 'bg-gradient-to-r from-red-100/80 to-red-50/40'
                : isEven ? 'bg-gray-50' : 'bg-white';
              
              return (
                <tr key={`individual-${i}`} 
                    className={`${backgroundClass} ${isPendente ? 'border-l-4 border-l-red-500' : ''}`}>
                  <td className="border border-gray-600 px-2 py-1 text-center">
                    {mat.quantidade}
                  </td>
                  <td className="border border-gray-600 px-2 py-1 text-left">
                    {mat.nome}
                  </td>
                  <td className="border border-gray-600 px-2 py-1 text-center">
                    {formatarMoedaDeCentavos(mat.valor_unit || 0)}
                  </td>
                  <td className="border border-gray-600 px-2 py-1 text-center">
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
          <div className="w-3 h-3 bg-cyan-600 rounded"></div>
          <span className="text-gray-300">Itens de conjunto</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span className="text-gray-300">Materiais individuais</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded"></div>
          <span className="text-gray-300">Pendente de devolução</span>
        </div>
      </div>
    </div>
  );
};

export default OrderMaterialsList;
