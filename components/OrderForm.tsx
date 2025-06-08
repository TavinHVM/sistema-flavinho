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
  // Calcular próximo número do contrato (exemplo: maior número + 1)
  const proximoNumero = form.numero || form.proximoNumero || "";
  return (
    <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2">
      <label className="text-xs text-gray-300 font-semibold">Nº do Contrato (gerado automaticamente)</label>
      <input className="rounded p-2 text-black bg-gray-200" value={proximoNumero} disabled />
      <label className="text-xs text-gray-300 font-semibold">Data da Locação</label>
      <input className="rounded p-2 text-black" type="date" value={form.data_locacao} onChange={e => setForm({ ...form, data_locacao: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Data do Evento</label>
      <input className="rounded p-2 text-black" type="date" value={form.data_evento} onChange={e => setForm({ ...form, data_evento: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Data de Retirada</label>
      <input className="rounded p-2 text-black" type="date" value={form.data_retirada} onChange={e => setForm({ ...form, data_retirada: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Nome do Cliente</label>
      <input className="rounded p-2 text-black" placeholder="Nome completo do cliente" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Endereço de Entrega</label>
      <input className="rounded p-2 text-black" placeholder="Rua, número, bairro" value={form.endereco} onChange={e => setForm({ ...form, endereco: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Telefone para Contato</label>
      <input className="rounded p-2 text-black" placeholder="(DDD) 99999-9999" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Residencial (opcional)</label>
      <input className="rounded p-2 text-black" placeholder="Apartamento, bloco, etc" value={form.residencial} onChange={e => setForm({ ...form, residencial: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Referência (opcional)</label>
      <input className="rounded p-2 text-black" placeholder="Ponto de referência próximo" value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} />
      <div className="bg-gray-700 rounded p-2 mt-2">
        <div className="font-bold mb-2">Materiais</div>
        {form.materiais.map((mat: any, idx: number) => (
          <div key={idx} className="flex flex-col gap-1 mb-2 border-b border-gray-600 pb-2">
            <label className="text-xs text-gray-300">Material</label>
            <select className="rounded p-2 text-black" value={mat.nome} onChange={e => handleMaterialChange(idx, "nome", e.target.value)}>
              <option value="">Selecione o material</option>
              {produtos.map((p) => (
                <option key={p.id} value={p.nome}>{p.nome}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-300">Quantidade</label>
                <input className="rounded p-2 text-black w-full" type="number" min={1} placeholder="Qtd" value={mat.quantidade} onChange={e => handleMaterialChange(idx, "quantidade", parseInt(e.target.value))} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-300">Valor Unitário (R$)</label>
                <input className="rounded p-2 text-black w-full" type="number" min={0} placeholder="Valor Unitário" value={mat.valor_unit} onChange={e => handleMaterialChange(idx, "valor_unit", parseFloat(e.target.value))} />
              </div>
            </div>
            <div className="text-xs text-gray-300">Total: R$ {mat.valor_total?.toFixed(2)}</div>
            {form.materiais.length > 1 && (
              <button className="text-red-400 text-xs mt-1" type="button" onClick={() => removeMaterial(idx)}>Remover</button>
            )}
          </div>
        ))}
        <button className="bg-blue-700 text-white rounded px-2 py-1 text-xs mt-2" type="button" onClick={addMaterial}>Adicionar Item</button>
      </div>
      <label className="text-xs text-gray-300 font-semibold">Horário de Entrega</label>
      <input className="rounded p-2 text-black" placeholder="Ex: Sábado das 11:30 às 15:30" value={form.entrega} onChange={e => setForm({ ...form, entrega: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Horário de Busca</label>
      <input className="rounded p-2 text-black" placeholder="Ex: Segunda das 8:00 às 18:00" value={form.busca} onChange={e => setForm({ ...form, busca: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Forma de Pagamento</label>
      <input className="rounded p-2 text-black" placeholder="Dinheiro, Pix, Cartão, etc" value={form.pagamento} onChange={e => setForm({ ...form, pagamento: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Valor Pago (R$)</label>
      <input className="rounded p-2 text-black" type="number" placeholder="Valor já pago" value={form.valor_pago} onChange={e => setForm({ ...form, valor_pago: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Valor Total (R$)</label>
      <input className="rounded p-2 text-black" type="number" placeholder="Valor total do pedido" value={form.valor_total} onChange={e => setForm({ ...form, valor_total: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">CPF do Cliente</label>
      <input className="rounded p-2 text-black" placeholder="CPF do cliente" value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Data de Devolução</label>
      <input className="rounded p-2 text-black" type="date" value={form.data_devolucao} onChange={e => setForm({ ...form, data_devolucao: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Responsável pela Entrega</label>
      <input className="rounded p-2 text-black" placeholder="Nome de quem entregou" value={form.responsavel_entregou} onChange={e => setForm({ ...form, responsavel_entregou: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Data da Entrega</label>
      <input className="rounded p-2 text-black" type="date" value={form.data_entregou} onChange={e => setForm({ ...form, data_entregou: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Responsável pelo Recebimento</label>
      <input className="rounded p-2 text-black" placeholder="Nome de quem recebeu" value={form.responsavel_recebeu} onChange={e => setForm({ ...form, responsavel_recebeu: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Data do Recebimento</label>
      <input className="rounded p-2 text-black" type="date" value={form.data_recebeu} onChange={e => setForm({ ...form, data_recebeu: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Responsável pela Busca</label>
      <input className="rounded p-2 text-black" placeholder="Nome de quem buscou" value={form.responsavel_buscou} onChange={e => setForm({ ...form, responsavel_buscou: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Data da Busca</label>
      <input className="rounded p-2 text-black" type="date" value={form.data_buscou} onChange={e => setForm({ ...form, data_buscou: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Responsável por Conferir Forro</label>
      <input className="rounded p-2 text-black" placeholder="Nome de quem conferiu forro" value={form.responsavel_conferiu_forro} onChange={e => setForm({ ...form, responsavel_conferiu_forro: e.target.value })} />
      <label className="text-xs text-gray-300 font-semibold">Responsável por Conferir Utensílio</label>
      <input className="rounded p-2 text-black" placeholder="Nome de quem conferiu utensílio" value={form.responsavel_conferiu_utensilio} onChange={e => setForm({ ...form, responsavel_conferiu_utensilio: e.target.value })} />
      <button className="bg-green-600 text-white rounded p-2 mt-2 font-bold" type="button" onClick={onSubmit} disabled={loading}>Salvar Pedido</button>
    </div>
  );
};

export default OrderForm;
