import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { formatarMoedaDeCentavos } from '../lib/currencyUtils';
import { FaCreditCard, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';

interface ParcelasResumoProps {
  pedidoId: number;
  compact?: boolean;
}

interface ResumoRapido {
  total_parcelas: number;
  parcelas_pagas: number;
  parcelas_pendentes: number;
  parcelas_atrasadas: number;
  valor_pago: number;
  valor_pendente: number;
  possui_parcelas: boolean;
}

const ParcelasResumo: React.FC<ParcelasResumoProps> = ({ pedidoId, compact = false }) => {
  const [resumo, setResumo] = useState<ResumoRapido | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumo = async () => {
      try {
        const { data, error } = await supabase
          .from('parcelas')
          .select('valor, data_vencimento, data_pagamento')
          .eq('pedido_id', pedidoId);

        if (error) throw error;

        if (!data || data.length === 0) {
          setResumo({
            total_parcelas: 0,
            parcelas_pagas: 0,
            parcelas_pendentes: 0,
            parcelas_atrasadas: 0,
            valor_pago: 0,
            valor_pendente: 0,
            possui_parcelas: false
          });
          return;
        }

        const hoje = new Date();
        let parcelas_pagas = 0;
        let parcelas_atrasadas = 0;
        let valor_pago = 0;
        let valor_pendente = 0;

        data.forEach(parcela => {
          if (parcela.data_pagamento) {
            parcelas_pagas++;
            valor_pago += parcela.valor;
          } else {
            const vencimento = new Date(parcela.data_vencimento);
            if (vencimento < hoje) {
              parcelas_atrasadas++;
            }
            valor_pendente += parcela.valor;
          }
        });

        setResumo({
          total_parcelas: data.length,
          parcelas_pagas,
          parcelas_pendentes: data.length - parcelas_pagas,
          parcelas_atrasadas,
          valor_pago,
          valor_pendente,
          possui_parcelas: true
        });
      } catch (error) {
        console.error('Erro ao buscar resumo das parcelas:', error);
        setResumo(null);
      } finally {
        setLoading(false);
      }
    };

    if (pedidoId) {
      fetchResumo();
    }
  }, [pedidoId]);

  if (loading) {
    return (
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
        {!compact && <span>Carregando...</span>}
      </div>
    );
  }

  if (!resumo || !resumo.possui_parcelas) {
    return compact ? null : (
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <FaCreditCard className="text-gray-400" />
        <span>Sem parcelas</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <FaCreditCard className="text-xs text-blue-400" />
        <span className="text-xs text-gray-300">
          {resumo.parcelas_pagas}/{resumo.total_parcelas}
        </span>
        {resumo.parcelas_atrasadas > 0 && (
          <FaExclamationTriangle className="text-xs text-red-400" />
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-700/30 rounded-lg p-2 border border-gray-600">
      <div className="flex items-center gap-2 mb-2">
        <FaCreditCard className="text-blue-400" />
        <span className="text-sm font-medium text-white">Parcelas</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1">
          <FaCheck className="text-green-400" />
          <span className="text-gray-300">Pagas: {resumo.parcelas_pagas}</span>
        </div>
        <div className="flex items-center gap-1">
          <FaClock className="text-yellow-400" />
          <span className="text-gray-300">Pendentes: {resumo.parcelas_pendentes}</span>
        </div>
        {resumo.parcelas_atrasadas > 0 && (
          <div className="flex items-center gap-1 col-span-2">
            <FaExclamationTriangle className="text-red-400" />
            <span className="text-red-400">Atrasadas: {resumo.parcelas_atrasadas}</span>
          </div>
        )}
      </div>

      {resumo.valor_pendente > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-xs">
            <span className="text-gray-400">Pendente: </span>
            <span className="text-red-400 font-medium">
              {formatarMoedaDeCentavos(resumo.valor_pendente)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParcelasResumo;
