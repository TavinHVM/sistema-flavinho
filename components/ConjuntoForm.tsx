import React, { useState } from "react";
import { FaPlus, FaTrash, FaEdit, FaSave } from "react-icons/fa";
import { Conjunto, ConjuntoItem } from "../types/Conjunto";
import { formatarMoedaDeCentavos } from "../lib/currencyUtils";

interface Produto {
  id: string;
  nome: string;
  preco: number;
  quantidade_empresa: number;
}

interface ConjuntoFormProps {
  form: Conjunto;
  setForm: (conjunto: Conjunto) => void;
  produtos: Produto[];
  onSubmit: () => void;
  loading?: boolean;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

const ConjuntoForm: React.FC<ConjuntoFormProps> = ({
  form,
  setForm,
  produtos,
  onSubmit,
  loading = false,
  isEditing = false,
  onCancelEdit,
}) => {
  const [showForm, setShowForm] = useState(!isEditing);

  const addItem = () => {
    setForm({
      ...form,
      itens: [...form.itens, { produto_nome: "", quantidade: 1 }]
    });
  };

  const removeItem = (index: number) => {
    const novosItens = form.itens.filter((_, i) => i !== index);
    setForm({ ...form, itens: novosItens });
  };

  const updateItem = (index: number, field: keyof ConjuntoItem, value: string | number) => {
    const novosItens = [...form.itens];
    if (field === "quantidade") {
      novosItens[index][field] = Number(value);
    } else {
      novosItens[index][field] = value as string;
    }
    setForm({ ...form, itens: novosItens });
  };

  const calcularPrecoIndividual = () => {
    return form.itens.reduce((total, item) => {
      const produto = produtos.find(p => p.nome === item.produto_nome);
      return total + (produto ? produto.preco * item.quantidade : 0);
    }, 0);
  };

  const formatarMoeda = (centavos: number) => {
    return formatarMoedaDeCentavos(centavos);
  };

  const precoIndividual = calcularPrecoIndividual();
  const economia = precoIndividual - form.preco_promocional;
  const percentualEconomia = precoIndividual > 0 ? (economia / precoIndividual) * 100 : 0;

  if (!showForm && !isEditing) {
    return (
      <div className="mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
        >
          <FaPlus /> Criar Novo Conjunto
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🎁 {isEditing ? "Editar Conjunto" : "Novo Conjunto"}
        </h2>
        {!isEditing && (
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nome do Conjunto
          </label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Kit Festa Completa"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preço Promocional
          </label>
          <input
            type="text"
            value={form.preco_promocional ? formatarMoedaDeCentavos(form.preco_promocional) : ''}
            onChange={(e) => {
              const valor = e.target.value.replace(/\D/g, '');
              setForm({ ...form, preco_promocional: Number(valor) });
            }}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="R$ 0,00"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Descrição (opcional)
        </label>
        <textarea
          value={form.descricao || ''}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Descreva o que inclui no conjunto..."
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Itens do Conjunto</h3>
          <button
            onClick={addItem}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaPlus className="text-sm" /> Adicionar Item
          </button>
        </div>

        <div className="space-y-3">
          {form.itens.map((item, index) => (
            <div key={index} className="flex gap-3 items-end bg-gray-700 p-4 rounded-lg">
              <div className="flex-1">
                <label className="block text-xs text-gray-300 mb-1">Produto</label>
                <select
                  value={item.produto_nome}
                  onChange={(e) => updateItem(index, "produto_nome", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um produto</option>
                  {produtos
                    .filter(p => p.quantidade_empresa > 0)
                    .sort((a, b) => a.nome.localeCompare(b.nome))
                    .map(produto => (
                      <option key={produto.id} value={produto.nome}>
                        {produto.nome} - {formatarMoeda(produto.preco)} (Estoque: {produto.quantidade_empresa})
                      </option>
                    ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-xs text-gray-300 mb-1">Qtd.</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantidade}
                  onChange={(e) => updateItem(index, "quantidade", e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="w-32 text-center">
                <label className="block text-xs text-gray-300 mb-1">Subtotal</label>
                <div className="px-3 py-2 bg-gray-600 rounded text-green-400 font-semibold">
                  {(() => {
                    const produto = produtos.find(p => p.nome === item.produto_nome);
                    const subtotal = produto ? produto.preco * item.quantidade : 0;
                    return formatarMoeda(subtotal);
                  })()}
                </div>
              </div>

              <button
                onClick={() => removeItem(index)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors"
                disabled={form.itens.length === 1}
              >
                <FaTrash className="text-sm" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Resumo de Preços */}
      {form.itens.length > 0 && form.itens.some(item => item.produto_nome) && (
        <div className="mb-6 bg-gradient-to-r from-green-900/20 to-blue-900/20 rounded-xl p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">💰 Resumo de Preços</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Preço Individual</div>
              <div className="text-red-400 text-xl font-bold">{formatarMoeda(precoIndividual)}</div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Preço Promocional</div>
              <div className="text-green-400 text-xl font-bold">{formatarMoeda(form.preco_promocional)}</div>
            </div>
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Economia</div>
              <div className="text-blue-400 text-xl font-bold">
                {formatarMoeda(economia)}
                {percentualEconomia > 0 && (
                  <div className="text-sm text-blue-300">({percentualEconomia.toFixed(1)}% off)</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onSubmit}
          disabled={loading || !form.nome || form.itens.length === 0 || !form.itens.some(item => item.produto_nome) || form.preco_promocional <= 0}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>⏳ Salvando...</>
          ) : (
            <>
              {isEditing ? <FaEdit /> : <FaSave />}
              {isEditing ? "Atualizar" : "Salvar"} Conjunto
            </>
          )}
        </button>

        {isEditing && onCancelEdit && (
          <button
            onClick={onCancelEdit}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};

export default ConjuntoForm;
