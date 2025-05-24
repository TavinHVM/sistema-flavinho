import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type Produto = {
  id: string;
  nome: string;
  quantidade_empresa: number;
  quantidade_rua: number;
  created_at: string;
};

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState({
    nome: '',
    quantidade_empresa: 0,
    quantidade_rua: 0,
  });

  // Buscar produtos
  const fetchProdutos = async () => {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setProdutos(data);
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  // Adicionar produto
  const adicionarProduto = async () => {
    const { error } = await supabase.from('produtos').insert([form]);

    if (!error) {
      setForm({ nome: '', quantidade_empresa: 0 , quantidade_rua: 0 });
      alert('Produto adicionado com sucesso!');
      fetchProdutos();
    } else {
      console.error('Erro ao adicionar produto:', error);
      alert('Erro ao adicionar produto!');
    }
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Controle de Estoque - Flavinho</h1>

      <div className="mb-6 bg-[#1E1E1E] p-4 rounded shadow text-white">
        <h3 className="text-xl font-semibold mb-2">Adicionar Produto</h3>
        <h6 className="text-sm mb-2">
          Preencha os campos abaixo para adicionar um novo produto ao estoque.
        </h6>
        <input
          className="border p-2 w-full mb-2 bg-[#1b1b1b] placeholder-[#adadad]"
          placeholder="Nome do produto"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
        />
        <input
          type="number"
          className="border p-2 w-full mb-2 bg-[#1b1b1b] placeholder-[#adadad]"
          placeholder="Quantidade na empresa"
          value={form.quantidade_empresa}
          onChange={(e) =>
            setForm({ ...form, quantidade_empresa: parseInt(e.target.value) })
          }
        />
        <input
          type="number"
          className="border p-2 w-full mb-2 bg-[#1b1b1b] placeholder-[#adadad]"
          placeholder="Quantidade em rota de entrega"
          value={form.quantidade_rua}
          onChange={(e) =>
            setForm({ ...form, quantidade_rua: parseInt(e.target.value) })
          }
        />
        <button
          onClick={adicionarProduto}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Adicionar Produto
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-2">Produtos Cadastrados</h2>
      <ul className="bg-[#1b1b1b] p-4 rounded shadow divide-y">
        {produtos.map((produto) => (
          <li key={produto.id} className="py-2">
            <strong>{produto.nome}</strong> — Na empresa: {produto.quantidade_empresa} | Em rota de entrega: {produto.quantidade_rua}
          </li>
        ))}
      </ul>
    </main>
  );
}
