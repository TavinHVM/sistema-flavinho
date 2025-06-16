import React from "react";

interface PedidoItem {
  nome: string;
  quantidade: number;
  valor_unit: number;
  valor_total: number;
}

interface OrderFormProps {
  form: any;
  setForm: (f: any) => void;
  produtos: any[];
  onSubmit: () => void;
  handleMaterialChange: (idx: number, field: string, value: any) => void;
  addMaterial: () => void;
  removeMaterial: (idx: number) => void;
  loading?: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({
  form,
  setForm,
  produtos,
  onSubmit,
  handleMaterialChange,
  addMaterial,
  removeMaterial,
  loading
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2">
      {/* Linha 1: Datas */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Data da Locação</label>
          <input className="rounded p-2 text-black w-full" type="date" value={form.data_locacao} onChange={e => setForm({ ...form, data_locacao: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Data do Evento</label>
          <input className="rounded p-2 text-black w-full" type="date" value={form.data_evento} onChange={e => setForm({ ...form, data_evento: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Data de Devolução</label>
          <input className="rounded p-2 text-black w-full" type="date" value={form.data_devolucao} onChange={e => setForm({ ...form, data_devolucao: e.target.value })} />
        </div>
      </div>
      {/* Linha 2: Nome e CPF */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Nome do Cliente</label>
          <input className="rounded p-2 text-black w-full" placeholder="Nome completo" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">CPF</label>
          <input className="rounded p-2 text-black w-full" placeholder="CPF do cliente" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} />
        </div>
      </div>
      {/* Linha 3: Endereço, Telefone, Referência */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Endereço</label>
          <input className="rounded p-2 text-black w-full" placeholder="Rua, número, bairro" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Telefone</label>
          <input className="rounded p-2 text-black w-full" placeholder="(DDD) 99999-9999" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Referência</label>
          <input className="rounded p-2 text-black w-full" placeholder="Ponto de referência" value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} />
        </div>
      </div>
      {/* Linha 4: Residencial */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">End. Residencial</label>
          <input className="rounded p-2 text-black w-full" placeholder="Apartamento, bloco, etc" value={form.residencial} onChange={e => setForm({ ...form, residencial: e.target.value })} />
        </div>
      </div>
      {/* Materiais */}
      <div className="bg-gray-700 rounded p-2 mt-2">
        <div className="font-bold mb-2">Materiais</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-600">
                <th className="p-1">Quant.</th>
                <th className="p-1">Material</th>
                <th className="p-1">Valor Unit.</th>
                <th className="p-1">Valor Total</th>
                <th className="p-1"></th>
              </tr>
            </thead>
            <tbody>
              {form.materiais.map((mat: any, idx: number) => (
                <tr key={mat.nome + '-' + idx} className="border-b border-gray-500">
                  <td className="p-1">
                    <input className="rounded p-1 text-black w-16" type="number" min={1} value={mat.quantidade} onChange={e => handleMaterialChange(idx, "quantidade", parseInt(e.target.value))} />
                  </td>
                  <td className="p-1">
                    <select className="rounded p-1 text-black w-full" value={mat.nome} onChange={e => handleMaterialChange(idx, "nome", e.target.value)}>
                      <option value="">Selecione</option>
                      {produtos.map((p) => (
                        <option key={p.id} value={p.nome}>{p.nome}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1">
                    <input className="rounded p-1 text-black w-20" type="number" min={0} value={mat.valor_unit} onChange={e => handleMaterialChange(idx, "valor_unit", parseFloat(e.target.value))} />
                  </td>
                  <td className="p-1">R$ {mat.valor_total?.toFixed(2)}</td>
                  <td className="p-1">
                    {form.materiais.length > 1 && (
                      <button className="text-red-400 text-xs" type="button" onClick={() => removeMaterial(idx)}>Remover</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="bg-blue-700 text-white rounded px-2 py-1 text-xs mt-2" type="button" onClick={addMaterial}>Adicionar Item</button>
      </div>
      {/* Linha 5: Entrega, Busca, Pagamento */}
      <div className="flex flex-col md:flex-row gap-2 mt-2">
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Horário de Entrega</label>
          <input className="rounded p-2 text-black w-full" placeholder="Ex: Sábado das 11:30 às 15:30" value={form.entrega} onChange={e => setForm({ ...form, entrega: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Horário de Busca</label>
          <input className="rounded p-2 text-black w-full" placeholder="Ex: Segunda das 8:00 às 18:00" value={form.busca} onChange={e => setForm({ ...form, busca: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Forma de Pagamento</label>
          <input className="rounded p-2 text-black w-full" placeholder="Dinheiro, Pix, Cartão, etc" value={form.pagamento} onChange={e => setForm({ ...form, pagamento: e.target.value })} />
        </div>
      </div>
      {/* Linha 6: Valores */}
      <div className="flex flex-col md:flex-row gap-2 mt-2">
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Valor Pago (R$)</label>
          <input className="rounded p-2 text-black w-full" type="number" value={form.valor_pago} onChange={e => setForm({ ...form, valor_pago: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Desconto (R$)</label>
          <input className="rounded p-2 text-black w-full" type="number" value={form.desconto} onChange={e => setForm({ ...form, desconto: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Valor Total (R$)</label>
          <input className="rounded p-2 text-black w-full" type="number" value={form.valor_total} onChange={e => setForm({ ...form, valor_total: e.target.value })} />
        </div>
      </div>
      {/* Linha 7: Responsáveis */}
      <div className="flex flex-col md:flex-row gap-2 mt-2">
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Resp. Entregou</label>
          <input className="rounded p-2 text-black w-full" value={form.responsavel_entregou} onChange={e => setForm({ ...form, responsavel_entregou: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Data Entrega</label>
          <input className="rounded p-2 text-black w-full" type="date" value={form.data_entregou} onChange={e => setForm({ ...form, data_entregou: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Resp. Recebeu</label>
          <input className="rounded p-2 text-black w-full" value={form.responsavel_recebeu} onChange={e => setForm({ ...form, responsavel_recebeu: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Data Recebeu</label>
          <input className="rounded p-2 text-black w-full" type="date" value={form.data_recebeu} onChange={e => setForm({ ...form, data_recebeu: e.target.value })} />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 mt-2">
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Resp. Buscou</label>
          <input className="rounded p-2 text-black w-full" value={form.responsavel_buscou} onChange={e => setForm({ ...form, responsavel_buscou: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Data Busca</label>
          <input className="rounded p-2 text-black w-full" type="date" value={form.data_buscou} onChange={e => setForm({ ...form, data_buscou: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Resp. Conferiu Forro</label>
          <input className="rounded p-2 text-black w-full" value={form.responsavel_conferiu_forro} onChange={e => setForm({ ...form, responsavel_conferiu_forro: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Resp. Conferiu Utensílio</label>
          <input className="rounded p-2 text-black w-full" value={form.responsavel_conferiu_utensilio} onChange={e => setForm({ ...form, responsavel_conferiu_utensilio: e.target.value })} />
        </div>
      </div>
      {/* Linha 8: Assinatura removida da tela, permanece apenas no PDF */}
      {/* <div className="flex flex-col md:flex-row gap-2 mt-4 items-end">
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">Assinatura</label>
          <input className="rounded p-2 text-black w-full" value={form.assinatura} onChange={e => setForm({ ...form, assinatura: e.target.value })} />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-300 font-semibold">CPF/RG</label>
          <input className="rounded p-2 text-black w-full" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} />
        </div>
      </div> */}
      <button className="bg-green-600 text-white rounded p-2 mt-4 font-bold" type="button" onClick={onSubmit} disabled={loading}>Salvar Pedido</button>
    </div>
  );
};

export default OrderForm;
