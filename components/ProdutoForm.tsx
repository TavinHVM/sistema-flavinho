import { FaEdit, FaPlus } from "react-icons/fa";
import { forwardRef } from "react";

interface ProdutoFormProps {
  form: { nome: string; quantidade_empresa: string; quantidade_rua: string; preco: string };
  setForm: (form: { nome: string; quantidade_empresa: string; quantidade_rua: string; preco: string }) => void;
  onSubmit: () => void;
  editando: boolean;
  onCancel?: () => void;
}

const ProdutoForm = forwardRef<HTMLDivElement, ProdutoFormProps>(
  ({ form, setForm, onSubmit, editando, onCancel }, ref) => {
    function formatarMoeda(valor: string) {
      if (!valor) return "";
      const numero = parseInt(valor, 10);
      if (isNaN(numero)) return "";
      return (numero / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    return (
      <section
        className="mb-4 bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md"
        ref={ref}
      >
        <h2 className="font-poppins text-[1.1rem] font-semibold mb-4">
          {editando ? "Atualizar Produto" : "Adicionar Produto"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-white text-sm font-medium font-poppins">
              Nome
            </label>
            <input
              className="font-poppins p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do produto"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-white text-sm font-medium font-poppins">
              Qtde. Empresa
            </label>
            <input
              type="number"
              className="font-inter p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Quantidade na empresa"
              value={form.quantidade_empresa}
              onChange={e => {
                const onlyNumbers = e.target.value.replace(/\D/g, '');
                setForm({ ...form, quantidade_empresa: onlyNumbers });
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-white text-sm font-medium font-poppins">
              Qtde. Entrega
            </label>
            <input
              type="number"
              className="font-inter p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Quantidade em rota de entrega"
              value={form.quantidade_rua}
              onChange={e => {
                const onlyNumbers = e.target.value.replace(/\D/g, '');
                setForm({ ...form, quantidade_rua: onlyNumbers })
              }}
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 ml-1 text-white text-sm font-medium font-poppins">
              Preço
            </label>
            <input
              type="text"
              className="font-poppins p-3 rounded bg-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Preço do produto"
              value={formatarMoeda(form.preco)}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, "");
                setForm({ ...form, preco: raw });
              }}
            />
          </div>
        </div>
        <button
          onClick={onSubmit}
          className={`mt-4 w-full flex items-center justify-center gap-2 p-3 rounded text-white font-poppins text-[0.95rem] font-medium transition-all ${editando
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {editando ? <FaEdit /> : <FaPlus />}
          {editando ? "Atualizar Produto" : "Adicionar Produto"}
        </button>
        {editando && onCancel && (
          <button
            onClick={onCancel}
            className="mt-2 w-full flex items-center justify-center gap-2 p-3 rounded text-white font-poppins text-[0.95rem] font-medium transition-all bg-gray-600 hover:bg-gray-700"
            type="button"
          >
            Cancelar
          </button>
        )}
      </section>
    );
  }
);

ProdutoForm.displayName = "ProdutoForm";

export default ProdutoForm;