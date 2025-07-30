import React from "react";
import { Pedido } from "../types/Pedido";
import SectionTitle from "./SectionTitle";
import { FaTrash } from "react-icons/fa";
import { formatTelefoneBR } from "@/lib/formatNumber";
import { formatCpfCnpjBR } from "@/lib/formatCpfCnpj";

interface Material {
  nome: string;
  quantidade: number;
  valor_unit: number;
  valor_total: number;
}

interface Produto {
  id: string;
  nome: string;
  preco?: number;
}

interface OrderFormProps {
  form: Pedido & { materiais: Material[] };
  setForm: (f: Pedido & { materiais: Material[] }) => void;
  produtos: Produto[];
  onSubmit: () => void;
  handleMaterialChange: (idx: number, field: string, value: string | number) => void;
  addMaterial: () => void;
  removeMaterial: (idx: number) => void;
  loading?: boolean;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  form,
  setForm,
  produtos,
  onSubmit,
  addMaterial,
  removeMaterial,
  loading,
  isEditing = false,
  onCancelEdit,
}) => {
  function getPrecoProduto(nome: string): number {
    const prod = produtos.find((p) => p.nome === nome);
    return prod && prod.preco ? prod.preco : 0;
  }

  function handleMaterialFieldChange(idx: number, field: string, value: string | number) {
    const materiais = [...form.materiais];
    if (field === "nome") {
      materiais[idx].nome = value as string;
      materiais[idx].valor_unit = getPrecoProduto(value as string) / 100;
      materiais[idx].valor_total = materiais[idx].quantidade * materiais[idx].valor_unit;
    } else if (field === "quantidade") {
      materiais[idx].quantidade = Number(value);
      materiais[idx].valor_unit = getPrecoProduto(materiais[idx].nome) / 100;
      materiais[idx].valor_total = materiais[idx].quantidade * materiais[idx].valor_unit;
    }
    setForm({ ...form, materiais });
  }

  const totalGeral = form.materiais.reduce((acc, mat) => acc + (mat.valor_total || 0), 0);

  function formatarMoeda(valor: number) {
    if (!valor) return "";
    return (valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="mt-8 bg-gray-800 rounded-lg p-3 flex flex-col gap-2 w-full" id="order-form-scroll">
      <div className="flex items-center justify-center mb-3">
        <SectionTitle className="text-2xl">Novo Pedido</SectionTitle>
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
          <label className="text-xs text-gray-300 font-semibold">Endereço</label>
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
        <h2 className="text-white text-base font-semibold mt-2 text-center">Itens</h2>
      </div>
      {/* Tabela de itens com overflow-x no mobile */}
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-[450px] text-sm text-gray-200">
          <thead className="bg-gray-700 text-gray-300 text-left">
            <tr>
              <th className="p-2 font-medium">Quant.</th>
              <th className="p-2 font-medium">Item</th>
              <th className="p-2 font-medium">Valor Unit.</th>
              <th className="p-2 font-medium">Valor Total</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {form.materiais.map((mat: Material, idx: number) => (
              <tr key={mat.nome + '-' + idx} className="border-b border-gray-600 hover:bg-gray-700 transition">
                <td className="p-2">
                  <input
                    type="number"
                    min={1}
                    value={mat.quantidade}
                    onChange={e => handleMaterialFieldChange(idx, "quantidade", parseInt(e.target.value))}
                    className="w-16 px-2 py-1 rounded bg-gray-100 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="p-2 min-w-[160px]">
                  <select
                    value={mat.nome}
                    onChange={e => handleMaterialFieldChange(idx, "nome", e.target.value)}
                    className="min-w-[140px] px-2 py-1 rounded bg-gray-100 text-black border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    {produtos
                      .slice()
                      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
                      .map(p => (
                        <option key={p.id} value={p.nome}>{p.nome}</option>
                      ))}
                  </select>
                </td>

                <td className="p-2">
                  <input
                    type="text"
                    disabled
                    value={getPrecoProduto(mat.nome) ? (getPrecoProduto(mat.nome) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : ''}
                    className="w-24 px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-300"
                  />
                </td>
                <td className="p-2 text-green-300 font-medium">
                  R$ {mat.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="p-2 text-right">
                  {form.materiais.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(idx)}
                      className="text-red-400 hover:text-red-300 text-sm transition font-bold mr-3"
                    >
                      <FaTrash className="inline mr-1" />
                      Remover
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addMaterial}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow transition"
      >
        + Adicionar Item
      </button>

      <div className="flex justify-end items-center mt-2 border-b-2 border-b-gray-500 mb-2">
        <span className="text-gray-300 text-base font-semibold mr-2 mb-2">Total Geral:</span>
        <span className="text-green-400 text-xl font-bold mb-2">
          R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
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
            value={formatarMoeda(form.valor_pago * 100)}
            onChange={e => {
              const raw = e.target.value.replace(/\D/g, "");
              const valorPagoEmCentavos = parseInt(raw, 10) || 0;
              const valorPago = valorPagoEmCentavos / 100;
              const valorDeve = totalGeral - valorPago;
              setForm({ ...form, valor_pago: valorPago, valor_deve: valorDeve });
            }} 
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="text-xs text-gray-300 font-semibold">Valor a Pagar</label>
          <input 
            className="rounded p-2 text-gray-500 bg-gray-200 w-full" 
            type="text"
            disabled
            value={`R$ ${form.valor_deve.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
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
