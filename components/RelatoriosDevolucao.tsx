import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { formatCpfCnpjBR } from "../lib/formatCpfCnpj";
import { FaCalendarAlt, FaUser, FaBox, FaFileExport, FaSearch } from "react-icons/fa";

interface DevolucaoRelatorio {
  id: string;
  numero_pedido: number;
  cliente: string;
  cpf: string;
  nome_produto: string;
  quantidade_devolvida: number;
  responsavel_devolucao: string;
  data_devolucao: string;
  observacoes?: string;
}

interface DevolucaoSupabase {
  id: string;
  numero_pedido: number;
  nome_produto: string;
  quantidade_devolvida: number;
  responsavel_devolucao: string;
  data_devolucao: string;
  observacoes?: string;
  pedidos: {
    cliente: string;
    cpf: string;
  } | null;
}

const RelatoriosDevolucao: React.FC = () => {
  const [devolucoes, setDevolucoes] = useState<DevolucaoRelatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroData, setFiltroData] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroCpf, setFiltroCpf] = useState("");
  const [filtroProduto, setFiltroProduto] = useState("");
  const [filtroResponsavel, setFiltroResponsavel] = useState("");

  useEffect(() => {
    carregarDevolucoes();
  }, []);

  const carregarDevolucoes = async () => {
    try {
      setLoading(true);
      
      // Buscar devoluções com dados do pedido
      const { data: devolucoes, error } = await supabase
        .from("devolucoes")
        .select(`
          id,
          numero_pedido,
          nome_produto,
          quantidade_devolvida,
          responsavel_devolucao,
          data_devolucao,
          observacoes,
          pedidos:numero_pedido (
            cliente,
            cpf
          )
        `)
        .order("data_devolucao", { ascending: false }) as { data: DevolucaoSupabase[] | null; error: unknown };

      if (error) {
        console.error("Erro ao carregar devoluções:", error);
        return;
      }

      // Formatar dados para o relatório
      const devolucaesFormatadas = devolucoes?.map((dev) => ({
        id: dev.id,
        numero_pedido: dev.numero_pedido,
        cliente: dev.pedidos?.cliente || "Cliente não encontrado",
        cpf: dev.pedidos?.cpf || "CPF não encontrado",
        nome_produto: dev.nome_produto,
        quantidade_devolvida: dev.quantidade_devolvida,
        responsavel_devolucao: dev.responsavel_devolucao,
        data_devolucao: dev.data_devolucao,
        observacoes: dev.observacoes
      })) || [];

      setDevolucoes(devolucaesFormatadas);
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
    } finally {
      setLoading(false);
    }
  };

  const devolucoesFiltradas = devolucoes.filter((dev) => {
    // Converter data de devolução para timezone de Brasília e extrair apenas a data
    const dataBrasilia = new Date(dev.data_devolucao).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
    const dataFormatada = dataBrasilia.split('/').reverse().join('-'); // Converter para YYYY-MM-DD
    
    const dataMatch = !filtroData || dataFormatada === filtroData;
    const clienteMatch = !filtroCliente || dev.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
    const cpfMatch = !filtroCpf || dev.cpf.includes(filtroCpf);
    const produtoMatch = !filtroProduto || dev.nome_produto.toLowerCase().includes(filtroProduto.toLowerCase());
    const responsavelMatch = !filtroResponsavel || dev.responsavel_devolucao.toLowerCase().includes(filtroResponsavel.toLowerCase());
    
    return dataMatch && clienteMatch && cpfMatch && produtoMatch && responsavelMatch;
  });

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const exportarCSV = () => {
    const headers = ["Data", "Pedido", "Cliente", "CPF", "Produto", "Quantidade", "Responsável", "Observações"];
    const csvData = devolucoesFiltradas.map(dev => [
      formatarData(dev.data_devolucao),
      dev.numero_pedido,
      dev.cliente,
      dev.cpf,
      dev.nome_produto,
      dev.quantidade_devolvida,
      dev.responsavel_devolucao,
      dev.observacoes || ""
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-devolucoes-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const totalItensDevolvidos = devolucoesFiltradas.reduce((total, dev) => total + dev.quantidade_devolvida, 0);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-center py-8">
          <div className="text-white text-lg">Carregando relatório...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 lg:mb-0 flex items-center gap-3">
          <FaBox className="text-blue-400" />
          Relatório de Devoluções
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={carregarDevolucoes}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaSearch /> Atualizar
          </button>
          <button
            onClick={exportarCSV}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaFileExport /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            <FaCalendarAlt className="inline mr-1" /> Data
          </label>
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            <FaUser className="inline mr-1" /> Cliente
          </label>
          <input
            type="text"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            placeholder="Filtrar por cliente"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            <FaUser className="inline mr-1" /> CPF
          </label>
          <input
            type="text"
            value={filtroCpf}
            onChange={(e) => setFiltroCpf(e.target.value)}
            placeholder="Filtrar por CPF"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            <FaBox className="inline mr-1" /> Produto
          </label>
          <input
            type="text"
            value={filtroProduto}
            onChange={(e) => setFiltroProduto(e.target.value)}
            placeholder="Filtrar por produto"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            <FaUser className="inline mr-1" /> Responsável
          </label>
          <input
            type="text"
            value={filtroResponsavel}
            onChange={(e) => setFiltroResponsavel(e.target.value)}
            placeholder="Filtrar por responsável"
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-900/30 to-blue-800/30 rounded-lg p-4 border border-blue-700/50">
          <div className="text-blue-300 text-sm font-medium">Total de Devoluções</div>
          <div className="text-2xl font-bold text-white">{devolucoesFiltradas.length}</div>
        </div>
        
        <div className="bg-gradient-to-r from-green-900/30 to-green-800/30 rounded-lg p-4 border border-green-700/50">
          <div className="text-green-300 text-sm font-medium">Itens Devolvidos</div>
          <div className="text-2xl font-bold text-white">{totalItensDevolvidos}</div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-lg p-4 border border-purple-700/50">
          <div className="text-purple-300 text-sm font-medium">Pedidos Únicos</div>
          <div className="text-2xl font-bold text-white">
            {new Set(devolucoesFiltradas.map(d => d.numero_pedido)).size}
          </div>
        </div>
      </div>

      {/* Tabela de Devoluções */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-700 text-gray-300">
            <tr>
              <th className="px-4 py-3">Data/Hora</th>
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Qtd</th>
              <th className="px-4 py-3">Responsável</th>
              <th className="px-4 py-3">Observações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {devolucoesFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Nenhuma devolução encontrada
                </td>
              </tr>
            ) : (
              devolucoesFiltradas.map((dev) => (
                <tr key={dev.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 text-white">
                    {formatarData(dev.data_devolucao)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300">
                      #{dev.numero_pedido}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    <div>
                      <div className="font-medium">{dev.cliente}</div>
                      <div className="text-xs text-gray-400">{formatCpfCnpjBR(dev.cpf)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    {dev.nome_produto}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300">
                      {dev.quantidade_devolvida}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {dev.responsavel_devolucao}
                  </td>
                  <td className="px-4 py-3 text-gray-300 max-w-xs truncate">
                    {dev.observacoes || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RelatoriosDevolucao;
