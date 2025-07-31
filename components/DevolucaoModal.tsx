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
  onConfirmarDevolucao: (itensDevolvidos: DevolucaoItem[], observacoes: string) => void;
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
      const devolucoesAgregadas = devolucoes?.reduce((acc, dev) => {
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
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
            <FaUndo className="text-blue-400" />
            Registrar Devolução - Pedido #{pedido.numero}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-3xl transition-colors duration-200">&times;</button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Informações do Cliente */}
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Cliente: {pedido.cliente}</h3>
            <p className="text-gray-300">CPF: {pedido.cpf}</p>
          </div>

          {/* Responsável pela Devolução */}
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Responsável pela Devolução *
            </label>
            <input
              type="text"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome do funcionário responsável"
              required
            />
          </div>

          {/* Lista de Itens */}
          <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4">Itens para Devolução</h3>
            
            <div className="space-y-3">
              {itens.map((item, index) => (
                <div key={index} className="bg-gray-600/50 rounded-lg p-4 border border-gray-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{item.nome}</h4>
                      <div className="text-sm text-gray-300 mt-1">
                        <span>Alugado: {item.quantidade}</span>
                        {item.quantidade_devolvida > 0 && (
                          <span className="ml-4 text-green-400">Já devolvido: {item.quantidade_devolvida}</span>
                        )}
                        <span className="ml-4 text-yellow-400">Pendente: {item.quantidade_pendente}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-300 whitespace-nowrap">
                        Devolver agora:
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantidadeChange(index, item.devolucao_atual - 1)}
                          disabled={item.devolucao_atual <= 0}
                          className="w-8 h-8 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max={item.quantidade_pendente}
                          value={item.devolucao_atual}
                          onChange={(e) => handleQuantidadeChange(index, parseInt(e.target.value) || 0)}
                          className="w-20 p-2 bg-gray-700 border border-gray-500 rounded-lg text-white text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          onClick={() => handleQuantidadeChange(index, item.devolucao_atual + 1)}
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
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <FaTimes /> Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={totalItensDevolucao === 0 || !responsavel.trim()}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors duration-200"
          >
            <FaCheck /> Confirmar Devolução
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevolucaoModal;
