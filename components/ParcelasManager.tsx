import React, { useState, useEffect, useCallback } from 'react';
import { Parcela, ResumoParcelas } from '../types/Parcela';
import { supabase } from '../lib/supabaseClient';
import { formatarMoedaDeCentavos, formatarInputDeCentavos } from '../lib/currencyUtils';
import { formatDateBR } from '../lib/formatDate';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes, FaCreditCard, FaExclamationTriangle } from 'react-icons/fa';

interface ParcelasManagerProps {
  pedidoId: number;
  valorTotal: number; // em centavos
  onParcelasChange?: (resumo: ResumoParcelas) => void;
}

const ParcelasManager: React.FC<ParcelasManagerProps> = ({ 
  pedidoId, 
  valorTotal, 
  onParcelasChange 
}) => {
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Form para nova parcela
  const [novaParcela, setNovaParcela] = useState<Partial<Parcela>>({
    numero_parcela: 1,
    valor: 0,
    data_vencimento: '',
    metodo_pagamento: '',
    status: 'pendente',
    observacoes: ''
  });

  // Form para edição
  const [parcelaEditando, setParcelaEditando] = useState<Partial<Parcela>>({});

  // Buscar parcelas do pedido
  const fetchParcelas = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parcelas')
        .select('*')
        .eq('pedido_id', pedidoId)
        .order('numero_parcela', { ascending: true });

      if (error) throw error;
      
      const parcelasComStatus = data?.map(parcela => ({
        ...parcela,
        status: calcularStatusParcela(parcela)
      })) || [];
      
      setParcelas(parcelasComStatus);
      
      // Calcular resumo e notificar componente pai
      if (onParcelasChange) {
        const resumo = calcularResumo(parcelasComStatus);
        onParcelasChange(resumo);
      }
    } catch (error) {
      console.error('Erro ao buscar parcelas:', error);
      showToast('error', 'Erro ao carregar parcelas');
    } finally {
      setLoading(false);
    }
  }, [pedidoId, onParcelasChange]);

  // Calcular status da parcela baseado na data
  const calcularStatusParcela = (parcela: Parcela): 'pendente' | 'paga' | 'atrasada' => {
    if (parcela.data_pagamento) return 'paga';
    
    const hoje = new Date();
    const vencimento = new Date(parcela.data_vencimento);
    
    if (vencimento < hoje) return 'atrasada';
    return 'pendente';
  };

  // Calcular resumo das parcelas
  const calcularResumo = (parcelasLista: Parcela[]): ResumoParcelas => {
    const total_parcelas = parcelasLista.length;
    const parcelas_pagas = parcelasLista.filter(p => p.status === 'paga').length;
    const parcelas_pendentes = total_parcelas - parcelas_pagas;
    const valor_total_parcelas = parcelasLista.reduce((acc, p) => acc + p.valor, 0);
    const valor_pago_parcelas = parcelasLista
      .filter(p => p.status === 'paga')
      .reduce((acc, p) => acc + p.valor, 0);
    const valor_pendente_parcelas = valor_total_parcelas - valor_pago_parcelas;

    return {
      total_parcelas,
      parcelas_pagas,
      parcelas_pendentes,
      valor_total_parcelas,
      valor_pago_parcelas,
      valor_pendente_parcelas
    };
  };

  // Mostrar toast
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Adicionar nova parcela
  const adicionarParcela = async () => {
    if (!novaParcela.valor || !novaParcela.data_vencimento) {
      showToast('error', 'Valor e data de vencimento são obrigatórios');
      return;
    }

    try {
      const proximoNumero = Math.max(...parcelas.map(p => p.numero_parcela), 0) + 1;
      
      const { error } = await supabase
        .from('parcelas')
        .insert([{
          pedido_id: pedidoId,
          numero_parcela: proximoNumero,
          valor: novaParcela.valor,
          data_vencimento: novaParcela.data_vencimento,
          metodo_pagamento: novaParcela.metodo_pagamento || null,
          status: 'pendente',
          observacoes: novaParcela.observacoes || null
        }]);

      if (error) throw error;

      showToast('success', 'Parcela adicionada com sucesso');
      setShowAddForm(false);
      setNovaParcela({
        numero_parcela: 1,
        valor: 0,
        data_vencimento: '',
        metodo_pagamento: '',
        status: 'pendente',
        observacoes: ''
      });
      fetchParcelas();
    } catch (error) {
      console.error('Erro ao adicionar parcela:', error);
      showToast('error', 'Erro ao adicionar parcela');
    }
  };

  // Atualizar parcela
  const atualizarParcela = async (id: string) => {
    try {
      const { error } = await supabase
        .from('parcelas')
        .update({
          valor: parcelaEditando.valor,
          data_vencimento: parcelaEditando.data_vencimento,
          data_pagamento: parcelaEditando.data_pagamento || null,
          metodo_pagamento: parcelaEditando.metodo_pagamento || null,
          observacoes: parcelaEditando.observacoes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      showToast('success', 'Parcela atualizada com sucesso');
      setEditingId(null);
      setParcelaEditando({});
      fetchParcelas();
    } catch (error) {
      console.error('Erro ao atualizar parcela:', error);
      showToast('error', 'Erro ao atualizar parcela');
    }
  };

  // Excluir parcela
  const excluirParcela = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta parcela?')) return;

    try {
      const { error } = await supabase
        .from('parcelas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast('success', 'Parcela excluída com sucesso');
      fetchParcelas();
    } catch (error) {
      console.error('Erro ao excluir parcela:', error);
      showToast('error', 'Erro ao excluir parcela');
    }
  };

  // Marcar como paga/não paga
  const togglePagamento = async (parcela: Parcela) => {
    try {
      const novoPagamento = parcela.data_pagamento ? null : new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('parcelas')
        .update({
          data_pagamento: novoPagamento,
          updated_at: new Date().toISOString()
        })
        .eq('id', parcela.id!);

      if (error) throw error;

      showToast('success', `Parcela marcada como ${novoPagamento ? 'paga' : 'não paga'}`);
      fetchParcelas();
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      showToast('error', 'Erro ao atualizar pagamento');
    }
  };

  // Iniciar edição
  const iniciarEdicao = (parcela: Parcela) => {
    setEditingId(parcela.id!);
    setParcelaEditando({ ...parcela });
  };

  // Cancelar edição
  const cancelarEdicao = () => {
    setEditingId(null);
    setParcelaEditando({});
  };

  // Gerar parcelas automaticamente
  const gerarParcelas = async (numeroParcelas: number) => {
    if (numeroParcelas < 1 || numeroParcelas > 12) {
      showToast('error', 'Número de parcelas deve ser entre 1 e 12');
      return;
    }

    try {
      const valorParcela = Math.round(valorTotal / numeroParcelas);
      const valorUltimaParcela = valorTotal - (valorParcela * (numeroParcelas - 1));
      
      const novasParcelas = [];
      const hoje = new Date();
      
      for (let i = 1; i <= numeroParcelas; i++) {
        const dataVencimento = new Date(hoje);
        dataVencimento.setMonth(dataVencimento.getMonth() + i);
        
        novasParcelas.push({
          pedido_id: pedidoId,
          numero_parcela: i,
          valor: i === numeroParcelas ? valorUltimaParcela : valorParcela,
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status: 'pendente'
        });
      }

      const { error } = await supabase
        .from('parcelas')
        .insert(novasParcelas);

      if (error) throw error;

      showToast('success', `${numeroParcelas} parcelas geradas automaticamente`);
      fetchParcelas();
    } catch (error) {
      console.error('Erro ao gerar parcelas:', error);
      showToast('error', 'Erro ao gerar parcelas');
    }
  };

  useEffect(() => {
    if (pedidoId) {
      fetchParcelas();
    }
  }, [pedidoId, fetchParcelas]);

  const resumo = calcularResumo(parcelas);

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg text-white ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <FaCreditCard className="text-blue-400" />
          Gestão de Parcelas
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1"
          >
            <FaPlus /> Adicionar
          </button>
          <select
            onChange={(e) => {
              const num = parseInt(e.target.value);
              if (num > 0) gerarParcelas(num);
              e.target.value = '';
            }}
            className="bg-gray-700 text-white text-xs px-2 py-1.5 rounded border border-gray-600"
            defaultValue=""
          >
            <option value="">Gerar Parcelas</option>
            {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => (
              <option key={num} value={num}>{num}x</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumo */}
      {parcelas.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-700/30 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-400">Total Parcelas</div>
            <div className="text-lg font-bold text-white">{resumo.total_parcelas}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Pagas</div>
            <div className="text-lg font-bold text-green-400">{resumo.parcelas_pagas}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Pendentes</div>
            <div className="text-lg font-bold text-yellow-400">{resumo.parcelas_pendentes}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">Valor Pendente</div>
            <div className="text-lg font-bold text-red-400">
              {formatarMoedaDeCentavos(resumo.valor_pendente_parcelas)}
            </div>
          </div>
        </div>
      )}

      {/* Formulário para nova parcela */}
      {showAddForm && (
        <div className="bg-gray-700/50 p-4 rounded-lg mb-4 border border-blue-500">
          <h4 className="text-white font-medium mb-3">Nova Parcela</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-300">Valor</label>
              <input
                type="text"
                className="w-full px-2 py-1 rounded bg-white text-black text-sm"
                placeholder="0,00"
                value={formatarInputDeCentavos(novaParcela.valor || 0)}
                onChange={e => {
                  const raw = e.target.value.replace(/\D/g, "");
                  setNovaParcela({ ...novaParcela, valor: parseInt(raw, 10) || 0 });
                }}
              />
            </div>
            <div>
              <label className="text-xs text-gray-300">Data de Vencimento</label>
              <input
                type="date"
                className="w-full px-2 py-1 rounded bg-white text-black text-sm"
                value={novaParcela.data_vencimento}
                onChange={e => setNovaParcela({ ...novaParcela, data_vencimento: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-300">Método de Pagamento</label>
              <input
                type="text"
                className="w-full px-2 py-1 rounded bg-white text-black text-sm"
                placeholder="Dinheiro, Pix, Cartão..."
                value={novaParcela.metodo_pagamento}
                onChange={e => setNovaParcela({ ...novaParcela, metodo_pagamento: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-300">Observações</label>
              <input
                type="text"
                className="w-full px-2 py-1 rounded bg-white text-black text-sm"
                placeholder="Observações..."
                value={novaParcela.observacoes}
                onChange={e => setNovaParcela({ ...novaParcela, observacoes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={adicionarParcela}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm"
            >
              <FaCheck /> Salvar
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm"
            >
              <FaTimes /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de parcelas */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <span className="text-gray-400 text-sm mt-2">Carregando parcelas...</span>
        </div>
      ) : parcelas.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <FaCreditCard className="mx-auto mb-2 text-3xl" />
          <p>Nenhuma parcela cadastrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {parcelas.map((parcela) => (
            <div
              key={parcela.id}
              className={`p-3 rounded-lg border-l-4 ${
                parcela.status === 'paga' 
                  ? 'border-green-500 bg-green-900/20' 
                  : parcela.status === 'atrasada'
                  ? 'border-red-500 bg-red-900/20'
                  : 'border-yellow-500 bg-yellow-900/20'
              }`}
            >
              {editingId === parcela.id ? (
                // Modo edição
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-300">Valor</label>
                      <input
                        type="text"
                        className="w-full px-2 py-1 rounded bg-white text-black text-sm"
                        value={formatarInputDeCentavos(parcelaEditando.valor || 0)}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setParcelaEditando({ ...parcelaEditando, valor: parseInt(raw, 10) || 0 });
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-300">Data de Vencimento</label>
                      <input
                        type="date"
                        className="w-full px-2 py-1 rounded bg-white text-black text-sm"
                        value={parcelaEditando.data_vencimento}
                        onChange={e => setParcelaEditando({ ...parcelaEditando, data_vencimento: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-300">Data de Pagamento</label>
                      <input
                        type="date"
                        className="w-full px-2 py-1 rounded bg-white text-black text-sm"
                        value={parcelaEditando.data_pagamento || ''}
                        onChange={e => setParcelaEditando({ ...parcelaEditando, data_pagamento: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-300">Método de Pagamento</label>
                      <input
                        type="text"
                        className="w-full px-2 py-1 rounded bg-white text-black text-sm"
                        value={parcelaEditando.metodo_pagamento || ''}
                        onChange={e => setParcelaEditando({ ...parcelaEditando, metodo_pagamento: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs text-gray-300">Observações</label>
                      <input
                        type="text"
                        className="w-full px-2 py-1 rounded bg-white text-black text-sm"
                        value={parcelaEditando.observacoes || ''}
                        onChange={e => setParcelaEditando({ ...parcelaEditando, observacoes: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => atualizarParcela(parcela.id!)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm"
                    >
                      <FaCheck /> Salvar
                    </button>
                    <button
                      onClick={cancelarEdicao}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm"
                    >
                      <FaTimes /> Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                // Modo visualização
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-white">
                        Parcela {parcela.numero_parcela}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        parcela.status === 'paga' 
                          ? 'bg-green-600 text-white' 
                          : parcela.status === 'atrasada'
                          ? 'bg-red-600 text-white'
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {parcela.status === 'paga' ? 'Paga' : 
                         parcela.status === 'atrasada' ? 'Atrasada' : 'Pendente'}
                      </span>
                      {parcela.status === 'atrasada' && (
                        <FaExclamationTriangle className="text-red-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Valor:</span>
                        <span className="font-bold text-white">
                          {formatarMoedaDeCentavos(parcela.valor)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vencimento:</span>
                        <span>{formatDateBR(parcela.data_vencimento)}</span>
                      </div>
                      {parcela.data_pagamento && (
                        <div className="flex justify-between">
                          <span>Pagamento:</span>
                          <span className="text-green-400">{formatDateBR(parcela.data_pagamento)}</span>
                        </div>
                      )}
                      {parcela.metodo_pagamento && (
                        <div className="flex justify-between">
                          <span>Método:</span>
                          <span>{parcela.metodo_pagamento}</span>
                        </div>
                      )}
                      {parcela.observacoes && (
                        <div className="flex justify-between">
                          <span>Obs:</span>
                          <span className="text-right max-w-40 break-words">{parcela.observacoes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button
                      onClick={() => togglePagamento(parcela)}
                      className={`p-1.5 rounded text-xs ${
                        parcela.data_pagamento 
                          ? 'bg-yellow-600 hover:bg-yellow-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                      title={parcela.data_pagamento ? 'Marcar como não paga' : 'Marcar como paga'}
                    >
                      {parcela.data_pagamento ? <FaTimes /> : <FaCheck />}
                    </button>
                    <button
                      onClick={() => iniciarEdicao(parcela)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded text-xs"
                      title="Editar parcela"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => excluirParcela(parcela.id!)}
                      className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded text-xs"
                      title="Excluir parcela"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParcelasManager;
