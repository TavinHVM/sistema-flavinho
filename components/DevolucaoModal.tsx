import React, { useState, useCallback } from "react";
import { Pedido, PedidoItem } from "../types/Pedido";
import { supabase } from "../lib/supabaseClient";
import { FaUndo, FaCheck, FaTimes } from "react-icons/fa";

interface DevolucaoItem extends PedidoItem {
  quantidade_devolvida: number;
  quantidade_pendente: number;
  devolucao_atual: number;
}

interface Props {
  pedido: Pedido | null;
  open: boolean;
  onClose: () => void;
  onConfirmarDevolucao: (itens: DevolucaoItem[], observacoes: string) => void;
}

const DevolucaoModal: React.FC<Props> = ({ pedido, open, onClose, onConfirmarDevolucao }) => {
  const [itens, setItens] = useState<DevolucaoItem[]>([]);
  const [observacoes, setObservacoes] = useState("");
  const [responsavel, setResponsavel] = useState("");

  const carregarDadosDevolucao = useCallback(async () => {
    if (!pedido) return;
    
    try {
      // Buscar devoluções já realizadas da tabela de devoluções
      const { data: devolucoes, error } = await supabase
        .from("devolucoes")
        .select("nome_produto, quantidade_devolvida")
        .eq("numero_pedido", pedido.numero);

      if (error) {
        console.error("Erro ao buscar devoluções:", error);
      }

      // Agregar quantidades devolvidas por produto
      const devolucoesAgregadas = devolucoes?.reduce((acc: Record<string, number>, dev: any) => {
        acc[dev.nome_produto] = (acc[dev.nome_produto] || 0) + dev.quantidade_devolvida;
        return acc;
      }, {} as Record<string, number>) || {};

      const itensIniciais = pedido.materiais.map(item => {
        const quantidadeDevolvida = devolucoesAgregadas[item.nome] || 0;
        const quantidadePendente = item.quantidade - quantidadeDevolvida;
        
        return {
          ...item,
          quantidade_devolvida: quantidadeDevolvida,
          quantidade_pendente: Math.max(0, quantidadePendente),
          devolucao_atual: 0
        };
      });

      setItens(itensIniciais);
      setObservacoes("");
      setResponsavel("");
    } catch (error) {
      console.error("Erro ao carregar dados de devolução:", error);
    }
  }, [pedido]);

  React.useEffect(() => {
    if (pedido && open) {
      carregarDadosDevolucao();
    }
  }, [pedido, open, carregarDadosDevolucao]);

  const handleQuantidadeChange = (index: number, valor: number) => {
    const novosItens = [...itens];
    const item = novosItens[index];
    const maxDevolucao = item.quantidade_pendente;
    
    // Garantir que a quantidade não seja negativa nem maior que o pendente
    const quantidadeValida = Math.max(0, Math.min(valor, maxDevolucao));
    
    novosItens[index] = {
      ...item,
      devolucao_atual: quantidadeValida
    };
    setItens(novosItens);
  };

  const handleConfirmar = () => {
    if (!responsavel.trim()) {
      alert("Por favor, informe o responsável pela devolução");
      return;
    }

    const itensComDevolucao = itens.filter(item => item.devolucao_atual > 0);
    
    if (itensComDevolucao.length === 0) {
      alert("Selecione pelo menos um item para devolução");
      return;
    }

    onConfirmarDevolucao(itensComDevolucao, observacoes);
    onClose();
  };

  const totalItensDevolucao = itens.reduce((total, item) => total + item.devolucao_atual, 0);

  if (!pedido) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 ${open ? '' : 'hidden'}`}
      onClick={onClose}
    >
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-900 to-purple-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaUndo className="text-blue-300 text-xl" />
              <div>
                <h2 className="text-xl font-semibold text-white">Registrar Devolução</h2>
                <p className="text-blue-200 text-sm">Pedido #{pedido.numero} - {pedido.cliente}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Responsável */}
          <div className="mb-6 bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Responsável pela Devolução <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome de quem está recebendo os itens"
              required
            />
          </div>

          {/* Lista de Itens */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              📦 Itens para Devolução
            </h3>
            
            <div className="space-y-4">
              {itens.map((item, index) => (
                <div key={`${item.nome}-${index}`} className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-white mb-2">{item.nome}</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Total:</span>
                          <span className="text-white font-semibold ml-1">{item.quantidade}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Devolvido:</span>
                          <span className="text-green-400 font-semibold ml-1">{item.quantidade_devolvida}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Pendente:</span>
                          <span className="text-yellow-400 font-semibold ml-1">{item.quantidade_pendente}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-gray-300 text-sm whitespace-nowrap">Devolver agora:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantidadeChange(index, Math.max(0, item.devolucao_atual - 1))}
                          disabled={item.devolucao_atual <= 0}
                          className="w-8 h-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                        >
                          -
                        </button>
                        <span className="w-12 text-center text-white font-semibold bg-gray-600 py-1 px-2 rounded">
                          {item.devolucao_atual}
                        </span>
                        <button
                          onClick={() => handleQuantidadeChange(index, Math.min(item.quantidade_pendente, item.devolucao_atual + 1))}
                          disabled={item.devolucao_atual >= item.quantidade_pendente}
                          className="w-8 h-8 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleQuantidadeChange(index, item.quantidade_pendente)}
                          disabled={item.quantidade_pendente === 0}
                          className="ml-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors duration-200"
                        >
                          Tudo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo */}
            <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-700">
              <p className="text-blue-300 font-semibold">
                Total de itens sendo devolvidos: {totalItensDevolucao}
              </p>
            </div>
          </div>

          {/* Observações */}
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observações da Devolução
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Observações sobre o estado dos itens, danos, etc..."
            />
          </div>
        </div>

        {/* Footer com botões */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-700 bg-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={totalItensDevolucao === 0 || !responsavel.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <FaCheck />
            Confirmar Devolução
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevolucaoModal;
