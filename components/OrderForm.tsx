import React from "react";
import { Pedido } from "../types/Pedido";
import { ConjuntoCompleto } from "../types/Conjunto";
import SectionTitle from "./SectionTitle";
import { FaTrash, FaGift } from "react-icons/fa";
import { formatTelefoneBR } from "@/lib/formatNumber";
import { formatCpfCnpjBR } from "@/lib/formatCpfCnpj";
import { 
  formatarMoedaDeCentavos, 
  formatarInputDeCentavos, 
} from "@/lib/currencyUtils";

interface Material {
  nome: string;
  quantidade: number;
  valor_unit: number; // em centavos
  valor_total: number; // em centavos
}

interface Produto {
  id: string;
  nome: string;
  preco?: number; // em centavos
  quantidade_empresa: number;
  quantidade_rua: number;
}

interface OrderFormProps {
  form: Pedido & { materiais: Material[] };
  setForm: (f: Pedido & { materiais: Material[] }) => void;
  produtos: Produto[];
  conjuntos?: ConjuntoCompleto[];
  onSubmit: () => void;
  handleMaterialChange: (idx: number, field: string, value: string | number) => void;
  addMaterial: () => void;
  removeMaterial: (idx: number) => void;
  loading?: boolean;
  loadingConjuntos?: boolean;
  onRefreshConjuntos?: () => void;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  form,
  setForm,
  produtos,
  conjuntos = [],
  onSubmit,
  addMaterial,
  removeMaterial,
  loading,
  loadingConjuntos = false,
  onRefreshConjuntos,
  isEditing = false,
  onCancelEdit,
}) => {
  function getPrecoProduto(nome: string): number {
    const prod = produtos.find((p) => p.nome === nome);
    return prod && prod.preco ? prod.preco : 0; // Retorna em centavos
  }

  function adicionarConjunto(conjunto: ConjuntoCompleto) {
    // Remover itens vazios primeiro
    const materiaisLimpos = form.materiais.filter(item => item.nome.trim() !== '');
    
    // Criar uma cópia dos materiais existentes
    const novosMateriais = [...materiaisLimpos];
    
    conjunto.itens.forEach(item => {
      const valorUnitarioProporcional = Math.round(conjunto.preco_promocional / conjunto.itens.reduce((total, i) => total + i.quantidade, 0));
      const nomeCompleto = `[CONJUNTO: ${conjunto.nome}] ${item.produto_nome}`;
      
      // Verificar se já existe um item igual (mesmo conjunto + produto)
      const itemExistente = novosMateriais.find(material => material.nome === nomeCompleto);
      
      if (itemExistente) {
        // Se existe, acumular as quantidades e recalcular o valor total
        itemExistente.quantidade += item.quantidade;
        itemExistente.valor_total = itemExistente.quantidade * itemExistente.valor_unit;
      } else {
        // Se não existe, adicionar novo item
        novosMateriais.push({
          nome: nomeCompleto,
          quantidade: item.quantidade,
          valor_unit: valorUnitarioProporcional, // já em centavos
          valor_total: valorUnitarioProporcional * item.quantidade,
          preco: conjunto.preco_promocional // em centavos
        });
      }
    });

    // Se não há itens limpos e só conjuntos, adicionar um item vazio no final para permitir adicionar produtos individuais
    if (materiaisLimpos.length === 0) {
      novosMateriais.push({ nome: "", quantidade: 1, valor_unit: 0, valor_total: 0, preco: 0 });
    }
    
    setForm({ ...form, materiais: novosMateriais });
  }

  function handleMaterialFieldChange(idx: number, field: string, value: string | number) {
    const materiais = [...form.materiais];
    if (field === "nome") {
      materiais[idx].nome = value as string;
      // Verificar se é um item de conjunto (não deve ser alterado diretamente)
      if (!materiais[idx].nome.includes('[CONJUNTO:')) {
        materiais[idx].valor_unit = getPrecoProduto(value as string); // em centavos
        materiais[idx].valor_total = materiais[idx].quantidade * materiais[idx].valor_unit;
      }
    } else if (field === "quantidade") {
      materiais[idx].quantidade = Number(value);
      // Verificar se é um item de conjunto (não deve ser alterado diretamente)
      if (!materiais[idx].nome.includes('[CONJUNTO:')) {
        materiais[idx].valor_unit = getPrecoProduto(materiais[idx].nome); // em centavos
        materiais[idx].valor_total = materiais[idx].quantidade * materiais[idx].valor_unit;
      } else {
        // Para itens de conjunto, manter o preço proporcional
        materiais[idx].valor_total = materiais[idx].quantidade * materiais[idx].valor_unit;
      }
    }
    setForm({ ...form, materiais });
  }

  const totalGeral = form.materiais.reduce((acc, mat) => acc + (mat.valor_total || 0), 0);

  // Função para calcular valores de desconto
  function calcularDesconto(totalBruto: number, tipoDesconto: 'valor' | 'porcentagem' | null | undefined, valorDesconto: number | null | undefined) {
    if (!tipoDesconto || !valorDesconto || valorDesconto <= 0) {
      return {
        valor_desconto: 0,
        valor_final: totalBruto
      };
    }

    let desconto = 0;
    if (tipoDesconto === 'porcentagem') {
      desconto = Math.round((totalBruto * valorDesconto) / 100); // em centavos
    } else if (tipoDesconto === 'valor') {
      desconto = valorDesconto; // já em centavos
    }

    return {
      valor_desconto: desconto,
      valor_final: Math.max(0, totalBruto - desconto)
    };
  }

  // Calcular valores atuais baseados no totalGeral (já em centavos)
  const valoresCalculados = calcularDesconto(totalGeral, form.desconto_tipo, form.desconto_valor);
  const valorFinalAtual = valoresCalculados.valor_final;
  const valorDescontoAtual = valoresCalculados.valor_desconto;

  return (
    <div className="mt-8 bg-gray-800 rounded-lg p-3 flex flex-col gap-2 w-full" id="order-form-scroll">
      <div className="flex items-center justify-center mb-3">
        <SectionTitle className="text-2xl">
          {isEditing ? 'Editar Pedido' : 'Novo Pedido'}
        </SectionTitle>
      </div>
      {/* Linha 1: Datas */}
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">Data da Locação</label>
          <input className="rounded p-2 text-black w-full" type="date" value={form.data_locacao} onChange={e => setForm({ ...form, data_locacao: e.target.value })} />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">Data do Evento</label>
          <input className="rounded p-2 text-black w-full" type="date" value={form.data_evento} onChange={e => setForm({ ...form, data_evento: e.target.value })} />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">Data de Devolução</label>
          <input className="rounded p-2 text-black w-full" type="date" value={form.data_devolucao} onChange={e => setForm({ ...form, data_devolucao: e.target.value })} />
        </div>
      </div>
      {/* Linha 2: Nome e CPF */}
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">Nome do Cliente</label>
          <input className="rounded p-2 text-black w-full" placeholder="Nome completo" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">CPF/CNPJ</label>
          <input
            className="rounded p-2 text-black w-full"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="CPF/CNPJ do cliente"
            value={formatCpfCnpjBR(form.cpf)}
            onChange={e => {
              const onlyNumbers = e.target.value.replace(/\D/g, '');
              setForm({ ...form, cpf: onlyNumbers });
            }}
          />
        </div>
      </div>
      {/* Linha 3: Endereço, Telefone, Referência */}
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">Local do evento</label>
          <input className="rounded p-2 text-black w-full" placeholder="Rua, número, bairro" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">Telefone</label>
          <input className="rounded p-2 text-black w-full" inputMode="numeric" pattern="[0-9]*" placeholder="(DDD) 99999-9999" value={formatTelefoneBR(form.telefone)} onChange={e => {
            const onlyNumbers = e.target.value.replace(/\D/g, '');
            setForm({ ...form, telefone: onlyNumbers });
          }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">Referência</label>
          <input className="rounded p-2 text-black w-full" placeholder="Ponto de referência" value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} />
        </div>
      </div>
      {/* Linha 4: Residencial */}
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">End. Residencial</label>
          <input className="rounded p-2 text-black w-full" placeholder="Apartamento, bloco, etc" value={form.residencial} onChange={e => setForm({ ...form, residencial: e.target.value })} />
        </div>
      </div>

      {/* Materiais */}
      <div className="mt-10 border-t-2 border-t-gray-500">
        <h2 className="text-white text-lg font-semibold mt-4 mb-6 text-center flex items-center justify-center gap-2">
          📋 Itens do Pedido
        </h2>
        
        {/* Seção para adicionar conjuntos */}
        {(conjuntos.length > 0 || loadingConjuntos) && (
          <div className="mb-6 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-600/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FaGift className="text-purple-400" />
                Conjuntos Promocionais Disponíveis
              </h3>
              <button
                onClick={onRefreshConjuntos}
                disabled={loadingConjuntos || !onRefreshConjuntos}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-3 py-1.5 rounded text-xs flex items-center gap-2 transition-colors"
                title="Atualizar lista de conjuntos"
              >
                {loadingConjuntos ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  "🔄"
                )}
                Atualizar
              </button>
            </div>
            
            {loadingConjuntos ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                  Carregando conjuntos promocionais...
                </div>
              </div>
            ) : (
              /* Container com altura limitada e scroll */
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-2">
                {conjuntos
                  .filter(c => c.ativo)
                  .map(conjunto => (
                    <div key={conjunto.id} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 hover:border-purple-500 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-medium text-sm flex-1 mr-2">{conjunto.nome}</h4>
                        <span className="text-purple-400 font-bold text-sm whitespace-nowrap">
                          {formatarMoedaDeCentavos(conjunto.preco_promocional || 0)}
                        </span>
                      </div>
                      
                      {conjunto.descricao && (
                        <p className="text-gray-400 text-xs mb-2 line-clamp-2">{conjunto.descricao}</p>
                      )}
                      
                      <div className="text-xs text-gray-300 mb-3">
                        <strong>Inclui:</strong> {conjunto.itens.map(item => `${item.quantidade}x ${item.produto_nome}`).join(', ')}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <div className="flex flex-col text-xs">
                          {conjunto.preco_total_individual && conjunto.preco_total_individual > 0 ? (
                            <>
                              <span className="text-red-400 line-through">
                                {formatarMoedaDeCentavos(conjunto.preco_total_individual)}
                              </span>
                              <span className="text-green-400 font-semibold text-xs">
                                {(((conjunto.economia || 0) / conjunto.preco_total_individual) * 100).toFixed(1)}% OFF
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400 text-xs">Calculando desconto...</span>
                          )}
                        </div>
                        <button
                          onClick={() => adicionarConjunto(conjunto)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-1 whitespace-nowrap"
                        >
                          <FaGift className="text-xs" />
                          Adicionar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Container responsivo para a tabela */}
      <div className="bg-gray-700/30 rounded-xl p-2 sm:p-4 border border-gray-600">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px] sm:min-w-[600px] text-xs sm:text-sm">
            <thead>
              <tr className="bg-gray-700 text-gray-200 border-b border-gray-600">
                <th className="p-2 sm:p-3 text-left rounded-tl-lg font-semibold w-16 sm:w-20">Qtd.</th>
                <th className="p-2 sm:p-3 text-left font-semibold min-w-[120px] sm:min-w-[200px]">Item</th>
                <th className="p-2 sm:p-3 text-center font-semibold w-20 sm:w-32 hidden sm:table-cell">Valor Unit.</th>
                <th className="p-2 sm:p-3 text-center font-semibold w-24 sm:w-32">Total</th>
                <th className="p-2 sm:p-3 text-center rounded-tr-lg font-semibold w-16 sm:w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800/50">
              {form.materiais.map((mat: Material, idx: number) => (
                <tr key={mat.nome + '-' + idx} className="border-b border-gray-600/50 hover:bg-gray-700/30 transition-colors">
                  
                  {/* Coluna Quantidade */}
                  <td className="p-2 sm:p-3">
                    {(() => {
                      // Extrair nome real do produto se for item de conjunto
                      let nomeProduto = mat.nome;
                      if (mat.nome.includes('[CONJUNTO:')) {
                        const match = mat.nome.match(/\] (.+)$/);
                        if (match) {
                          nomeProduto = match[1];
                        }
                      }
                      
                      const produto = produtos.find(p => p.nome === nomeProduto);
                      const estoqueDisponivel = produto?.quantidade_empresa || 0;
                      const quantidadeExcedida = mat.quantidade > estoqueDisponivel;
                      const isConjuntoItem = mat.nome.includes('[CONJUNTO:');
                      
                      return (
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            max={estoqueDisponivel}
                            value={mat.quantidade}
                            onChange={e => handleMaterialFieldChange(idx, "quantidade", parseInt(e.target.value))}
                            className={`w-12 sm:w-16 px-1 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm border-2 focus:outline-none focus:ring-2 transition-all ${
                              isConjuntoItem
                                ? 'bg-purple-100 border-purple-300 text-purple-800 focus:ring-purple-300'
                                : quantidadeExcedida && mat.nome
                                ? 'bg-red-50 border-red-400 focus:ring-red-300 focus:border-red-500 text-black' 
                                : 'bg-white border-gray-300 focus:ring-blue-300 focus:border-blue-500 text-black'
                            }`}
                            title={mat.nome ? `Máximo disponível: ${estoqueDisponivel}` : ''}
                            disabled={isConjuntoItem}
                          />
                          {quantidadeExcedida && mat.nome && !isConjuntoItem && (
                            <div className="absolute top-8 sm:top-12 left-0 bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow-lg z-20 whitespace-nowrap">
                              ⚠️ Máx: {estoqueDisponivel}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Coluna Item */}
                  <td className="p-2 sm:p-3">
                    <div className="relative">
                      {mat.nome.includes('[CONJUNTO:') ? (
                        // Item de conjunto - apenas visualização
                        <div className="w-full px-2 sm:px-3 py-1 sm:py-2 rounded bg-purple-100 border-2 border-purple-300 text-purple-800 font-medium">
                          <div className="flex items-center gap-1 sm:gap-2">
                            <FaGift className="text-purple-600 text-xs sm:text-sm flex-shrink-0" />
                            <span className="text-xs sm:text-sm truncate">{mat.nome}</span>
                          </div>
                        </div>
                      ) : (
                        // Item individual - seleção normal
                        <select
                          value={mat.nome}
                          onChange={e => handleMaterialFieldChange(idx, "nome", e.target.value)}
                          className="w-full px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-sm bg-white text-black border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                        >
                          <option value="" className="text-gray-500">Selecione um item</option>
                          {produtos
                            .slice()
                            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                            .map(p => {
                              const estoqueDisponivel = p.quantidade_empresa;
                              const estoqueTexto = estoqueDisponivel > 0 
                                ? ` (${estoqueDisponivel} disponível)`
                                : ' (SEM ESTOQUE)';
                              const isDisponivel = estoqueDisponivel > 0;
                              
                              return (
                                <option 
                                  key={p.id} 
                                  value={p.nome}
                                  disabled={!isDisponivel}
                                  style={{ 
                                    color: isDisponivel ? 'black' : '#999',
                                    backgroundColor: isDisponivel ? 'white' : '#f5f5f5'
                                  }}
                                >
                                  {p.nome}{estoqueTexto}
                                </option>
                              );
                            })}
                        </select>
                      )}
                      
                      {/* Badge de estoque */}
                      {mat.nome && !mat.nome.includes('[CONJUNTO:') && (() => {
                        const produto = produtos.find(p => p.nome === mat.nome);
                        const estoqueDisponivel = produto?.quantidade_empresa || 0;
                        
                        return (
                          <div className="absolute -bottom-6 sm:-bottom-7 left-0 z-10">
                            <span className={`inline-flex items-center px-1 sm:px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                              estoqueDisponivel > 10 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : estoqueDisponivel > 0 
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              📦 {estoqueDisponivel}
                            </span>
                          </div>
                        );
                      })()}
                      
                      {/* Badge para itens de conjunto */}
                      {mat.nome && mat.nome.includes('[CONJUNTO:') && (
                        <div className="absolute -bottom-6 sm:-bottom-7 left-0 z-10">
                          <span className="inline-flex items-center px-1 sm:px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            🎁 Conjunto
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Coluna Valor Unitário - Oculta em mobile */}
                  <td className="p-2 sm:p-3 text-center hidden sm:table-cell">
                    <div className={`px-2 sm:px-3 py-1 sm:py-2 rounded border text-xs sm:text-sm ${
                      mat.nome.includes('[CONJUNTO:') 
                        ? 'bg-purple-100 border-purple-200' 
                        : 'bg-gray-100 border-gray-200'
                    }`}>
                      <span className={`font-medium ${
                        mat.nome.includes('[CONJUNTO:') 
                          ? 'text-purple-700' 
                          : 'text-gray-700'
                      }`}>
                        {mat.nome.includes('[CONJUNTO:') 
                          ? formatarMoedaDeCentavos(mat.valor_unit)
                          : getPrecoProduto(mat.nome) ? 
                            formatarMoedaDeCentavos(getPrecoProduto(mat.nome)) 
                            : 'R$ 0,00'
                        }
                      </span>
                    </div>
                  </td>

                  {/* Coluna Valor Total */}
                  <td className="p-2 sm:p-3 text-center">
                    <div className="bg-green-100 px-2 sm:px-3 py-1 sm:py-2 rounded border border-green-200">
                      <span className="text-green-800 font-bold text-xs sm:text-sm">
                        {formatarMoedaDeCentavos(mat.valor_total || 0)}
                      </span>
                      {/* Mostrar valor unitário em mobile */}
                      <div className="block sm:hidden text-gray-600 text-xs mt-1">
                        {mat.nome.includes('[CONJUNTO:') 
                          ? `${formatarMoedaDeCentavos(mat.valor_unit)} un.`
                          : getPrecoProduto(mat.nome) ? 
                            `${formatarMoedaDeCentavos(getPrecoProduto(mat.nome))} un.` 
                            : 'R$ 0,00 un.'
                        }
                      </div>
                    </div>
                  </td>

                  {/* Coluna Ações */}
                  <td className="p-2 sm:p-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeMaterial(idx)}
                      className="bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded transition-all duration-200 flex items-center justify-center mx-auto shadow-sm hover:shadow-md"
                      title="Remover item"
                    >
                      <FaTrash className="text-xs sm:text-sm" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botão Adicionar Item */}
        <div className="mt-4 sm:mt-6 flex justify-center">
          <button
            type="button"
            onClick={addMaterial}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2 hover:shadow-lg transform hover:scale-105"
          >
            <span className="text-lg">+</span>
            Adicionar Item
          </button>
        </div>

        {/* Total Geral */}
        <div className="mt-6 pt-4 border-t border-gray-600">
          <div className="flex justify-between items-center bg-gray-700/50 p-4 rounded-lg mb-4">
            <span className="text-gray-300 text-lg font-semibold">Total Bruto:</span>
            <span className="text-blue-400 text-2xl font-bold">
              {formatarMoedaDeCentavos(totalGeral)}
            </span>
          </div>

          {/* Seção de Desconto */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-600 mb-4">
            <h3 className="text-gray-300 text-lg font-semibold mb-3">Desconto</h3>
            
            {/* Tipo de Desconto */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <label className="text-xs text-gray-300 font-semibold">Tipo de Desconto</label>
                <select
                  className="rounded p-2 text-black w-full"
                  value={form.desconto_tipo || ''}
                  onChange={e => {
                    const tipo = e.target.value as 'valor' | 'porcentagem' | '';
                    setForm({ 
                      ...form, 
                      desconto_tipo: tipo || null,
                      desconto_valor: 0,
                      valor_desconto: 0,
                      valor_final: totalGeral
                    });
                  }}
                >
                  <option value="">Sem desconto</option>
                  <option value="valor">Valor fixo (R$)</option>
                  <option value="porcentagem">Porcentagem (%)</option>
                </select>
              </div>
              
              {form.desconto_tipo && (
                <div className="flex-1 min-w-0">
                  <label className="text-xs text-gray-300 font-semibold">
                    {form.desconto_tipo === 'valor' ? 'Valor do Desconto (R$)' : 'Porcentagem do Desconto (%)'}
                  </label>
                  <input
                    className="rounded p-2 text-black w-full"
                    type={form.desconto_tipo === 'valor' ? 'text' : 'number'}
                    step={form.desconto_tipo === 'valor' ? undefined : '0.1'}
                    min="0"
                    max={form.desconto_tipo === 'porcentagem' ? '100' : undefined}
                    placeholder={form.desconto_tipo === 'valor' ? '0,00' : '0'}
                    value={form.desconto_tipo === 'valor' 
                      ? formatarInputDeCentavos(form.desconto_valor || 0) 
                      : (form.desconto_valor || '')
                    }
                    onChange={e => {
                      let valor = 0;
                      if (form.desconto_tipo === 'valor') {
                        // Para desconto em valor, converter de reais para centavos
                        const raw = e.target.value.replace(/\D/g, "");
                        valor = parseInt(raw, 10) || 0;
                      } else {
                        // Para porcentagem, manter como está
                        valor = parseFloat(e.target.value) || 0;
                      }
                      
                      const calculados = calcularDesconto(totalGeral, form.desconto_tipo, valor);
                      
                      setForm({ 
                        ...form, 
                        desconto_valor: valor,
                        valor_desconto: calculados.valor_desconto,
                        valor_final: calculados.valor_final,
                        valor_deve: calculados.valor_final - form.valor_pago
                      });
                    }}
                  />
                </div>
              )}
            </div>

            {/* Mostrar valores calculados do desconto */}
            {form.desconto_tipo && form.desconto_valor && form.desconto_valor > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <span className="text-gray-400 text-xs uppercase tracking-wide block">Desconto Aplicado</span>
                  <span className="text-red-400 text-lg font-bold">
                    - {formatarMoedaDeCentavos(valorDescontoAtual)}
                  </span>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <span className="text-gray-400 text-xs uppercase tracking-wide block">Valor Final</span>
                  <span className="text-green-400 text-lg font-bold">
                    {formatarMoedaDeCentavos(valorFinalAtual)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Total Final */}
          <div className="flex justify-between items-center bg-green-900/30 border border-green-600/50 p-4 rounded-lg">
            <span className="text-gray-300 text-lg font-semibold">Total Final:</span>
            <span className="text-green-400 text-2xl font-bold">
              {formatarMoedaDeCentavos(valorFinalAtual)}
            </span>
          </div>
        </div>
      </div>

      {/* Linha 5: Entrega, Busca, Pagamento */}
      <div className="flex flex-col sm:flex-row gap-2 mt-0 w-full">
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">Forma de Pagamento</label>
          <input className="rounded p-2 text-black w-full" placeholder="Dinheiro, Pix, Cartão, etc" value={form.pagamento} onChange={e => setForm({ ...form, pagamento: e.target.value })} />
        </div>
      </div>

      {/* Linha 6: Valores de Pagamento */}
      <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">Valor Pago</label>
          <input
            className="rounded p-2 text-black w-full"
            type="text"
            placeholder="0,00"
            value={formatarInputDeCentavos(form.valor_pago)}
            onChange={e => {
              const raw = e.target.value.replace(/\D/g, "");
              const valorPagoEmCentavos = parseInt(raw, 10) || 0;
              const valorDeve = valorFinalAtual - valorPagoEmCentavos;
              setForm({ ...form, valor_pago: valorPagoEmCentavos, valor_deve: valorDeve });
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">Valor a Pagar</label>
          <input
            className="rounded p-2 text-gray-500 bg-gray-200 w-full"
            type="text"
            disabled
            value={formatarMoedaDeCentavos(form.valor_deve)}
          />
        </div>
      </div>

      {/* Seção de Responsabilidades */}
      <div className="mt-6 border-t-2 border-t-gray-500">
        <h2 className="text-white text-base font-semibold mt-4 mb-4 text-center">Responsabilidades</h2>

        {/* Responsável Entregou */}
        <div className="mb-4">
          <h3 className="text-gray-300 text-sm font-medium mb-2">Entrega</h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Responsável Entregou</label>
              <input
                className="rounded p-2 text-black w-full"
                placeholder="Nome do responsável"
                value={form.resp_entregou || ''}
                onChange={e => setForm({ ...form, resp_entregou: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Data Entrega</label>
              <input
                className="rounded p-2 text-black w-full"
                type="date"
                value={form.data_entregou || ''}
                onChange={e => setForm({ ...form, data_entregou: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Hora Entrega</label>
              <input
                className="rounded p-2 text-black w-full"
                type="time"
                value={form.hora_entregou || ''}
                onChange={e => setForm({ ...form, hora_entregou: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Responsável Recebeu */}
        <div className="mb-4">
          <h3 className="text-gray-300 text-sm font-medium mb-2">Recebimento</h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Responsável Recebeu</label>
              <input
                className="rounded p-2 text-black w-full"
                placeholder="Nome do responsável"
                value={form.resp_recebeu || ''}
                onChange={e => setForm({ ...form, resp_recebeu: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Data Recebimento</label>
              <input
                className="rounded p-2 text-black w-full"
                type="date"
                value={form.data_recebeu || ''}
                onChange={e => setForm({ ...form, data_recebeu: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Hora Recebimento</label>
              <input
                className="rounded p-2 text-black w-full"
                type="time"
                value={form.hora_recebeu || ''}
                onChange={e => setForm({ ...form, hora_recebeu: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Responsável Buscou */}
        <div className="mb-4">
          <h3 className="text-gray-300 text-sm font-medium mb-2">Busca</h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Responsável Buscou</label>
              <input
                className="rounded p-2 text-black w-full"
                placeholder="Nome do responsável"
                value={form.resp_buscou || ''}
                onChange={e => setForm({ ...form, resp_buscou: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Data Busca</label>
              <input
                className="rounded p-2 text-black w-full"
                type="date"
                value={form.data_buscou || ''}
                onChange={e => setForm({ ...form, data_buscou: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Hora Busca</label>
              <input
                className="rounded p-2 text-black w-full"
                type="time"
                value={form.hora_buscou || ''}
                onChange={e => setForm({ ...form, hora_buscou: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Responsável Conferiu Forro */}
        <div className="mb-4">
          <h3 className="text-gray-300 text-sm font-medium mb-2">Conferência de Forro</h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Responsável Conferiu Forro</label>
              <input
                className="rounded p-2 text-black w-full"
                placeholder="Nome do responsável"
                value={form.resp_forro || ''}
                onChange={e => setForm({ ...form, resp_forro: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Data Conferência</label>
              <input
                className="rounded p-2 text-black w-full"
                type="date"
                value={form.data_forro || ''}
                onChange={e => setForm({ ...form, data_forro: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Hora Conferência</label>
              <input
                className="rounded p-2 text-black w-full"
                type="time"
                value={form.hora_forro || ''}
                onChange={e => setForm({ ...form, hora_forro: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Responsável Conferiu Utensílio */}
        <div className="mb-4">
          <h3 className="text-gray-300 text-sm font-medium mb-2">Conferência de Utensílios</h3>
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Responsável Conferiu Utensílio</label>
              <input
                className="rounded p-2 text-black w-full"
                placeholder="Nome do responsável"
                value={form.resp_utensilio || ''}
                onChange={e => setForm({ ...form, resp_utensilio: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Data Conferência</label>
              <input
                className="rounded p-2 text-black w-full"
                type="date"
                value={form.data_utensilio || ''}
                onChange={e => setForm({ ...form, data_utensilio: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs text-gray-300 font-semibold">Hora Conferência</label>
              <input
                className="rounded p-2 text-black w-full"
                type="time"
                value={form.hora_utensilio || ''}
                onChange={e => setForm({ ...form, hora_utensilio: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Campo de Observações */}
        <div className="mb-4">
          <h3 className="text-gray-300 text-sm font-medium mb-2">Observações</h3>
          <div className="w-full">
            <label className="text-xs text-gray-300 font-semibold">Observações Gerais</label>
            <textarea
              className="rounded p-2 text-black w-full h-20 resize-vertical overflow-y-auto"
              style={{
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                maxWidth: '100%',
                width: '100%',
                boxSizing: 'border-box'
              }}
              placeholder="Digite observações, comentários extras ou instruções especiais..."
              value={form.obs || ''}
              onChange={e => setForm({ ...form, obs: e.target.value })}
            />
          </div>
        </div>
      </div>

      <button
        className={`${isEditing ? 'bg-blue-600' : 'bg-green-600'} text-white rounded p-2 mt-4 font-bold w-full`}
        type="button"
        onClick={onSubmit}
        disabled={loading}
      >
        {isEditing ? 'Atualizar Pedido' : 'Salvar Pedido'}
      </button>
      {isEditing && (
        <button
          className="bg-gray-500 text-white rounded p-2 mt-2 font-bold w-full"
          type="button"
          onClick={onCancelEdit}
        >
          Cancelar
        </button>
      )}
    </div>
  );
};

export default OrderForm;
