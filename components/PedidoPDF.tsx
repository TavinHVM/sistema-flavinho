import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Pedido, PedidoItem } from "../types/Pedido";
import { formatDateBR } from "../lib/formatDate";
import logoBase64 from "./logoBase64";
import qrcodeBase64 from "./qrcodeBase64";
import { formatTelefoneBR } from "@/lib/formatNumber";
import { formatCpfCnpjBR } from "@/lib/formatCpfCnpj";
import { formatarMoedaDeCentavos } from "../lib/currencyUtils";

const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontSize: 8,
    fontFamily: "Helvetica",
    lineHeight: 1.2,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#2563eb",
  },
  empresaInfo: {
    flex: 1,
    paddingLeft: 8,
  },
  empresaNome: {
    fontWeight: "bold",
    fontSize: 10,
    color: "#1e40af",
    marginBottom: 2,
  },
  empresaContato: {
    fontSize: 7,
    color: "#374151",
    marginBottom: 1,
  },
  titleCenter: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 3,
    color: "#1f2937",
  },
  titleCenterRed: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 3,
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    padding: 4,
  },
  subTextCenter: {
    fontSize: 7,
    textAlign: "center",
    lineHeight: 1.3,
  },
  subTextCenterRed: {
    fontSize: 7,
    textAlign: "center",
    lineHeight: 1.3,
    color: "#dc2626",
    backgroundColor: "#fef2f2",
    padding: 3,
    marginVertical: 2,
  },
  clausulas: {
    marginVertical: 3,
    backgroundColor: "#f9fafb",
    padding: 4,
    borderWidth: 0.5,
    borderColor: "#e5e7eb",
  },
  clausulaItem: {
    fontSize: 7,
    marginBottom: 1,
    textAlign: "justify",
    color: "#374151",
    lineHeight: 1.2,
  },
  contratoSection: {
    backgroundColor: "#f0f9ff",
    padding: 5,
    marginVertical: 3,
    borderWidth: 0.5,
    borderColor: "#0ea5e9",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginTop: 4,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#1f2937",
    fontWeight: "bold",
  },
  tableHeaderText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 8,
  },
  tableCell: {
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#6b7280",
    padding: 2.5,
    textAlign: "center",
    fontSize: 7,
  },
  tableCellEven: {
    backgroundColor: "#f9fafb",
  },
  tableCellOdd: {
    backgroundColor: "#ffffff",
  },
  colQuant: { width: "10%" },
  colMaterial: { width: "55%" },
  colValorUnit: { width: "17.5%" },
  colValorTotal: { width: "17.5%" },
  // Estilos para conjuntos
  conjuntoHeaderRow: {
    backgroundColor: "#e0f2fe",
    borderLeftWidth: 3,
    borderLeftColor: "#0284c7",
    borderTopWidth: 1,
    borderTopColor: "#0284c7",
  },
  conjuntoHeaderText: {
    fontWeight: "bold",
    color: "#0284c7",
    fontSize: 8,
  },
  conjuntoItemRow: {
    backgroundColor: "#f0f9ff",
    paddingLeft: 5,
  },
  conjuntoItemText: {
    color: "#374151",
    fontSize: 7,
  },
  conjuntoIndicator: {
    width: 3,
    backgroundColor: "#0284c7",
    marginRight: 3,
  },
  totaisSection: {
    marginTop: 4,
    padding: 4,
    backgroundColor: "#f0fdf4",
    borderWidth: 0.5,
    borderColor: "#22c55e",
  },
  responsabilidadesSection: {
    marginTop: 5,
    padding: 5,
    backgroundColor: "#fefce8",
    borderWidth: 0.5,
    borderColor: "#eab308",
  },
  observacoesSection: {
    marginTop: 5,
    padding: 3,
    backgroundColor: "#f8fafc",
    borderWidth: 0.5,
    borderColor: "#64748b",
  },
  responsabilidadeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    paddingHorizontal: 3,
    paddingVertical: 2,
    backgroundColor: "#ffffff",
    borderWidth: 0.5,
    borderColor: "#d1d5db",
  },
  assinaturaSection: {
    marginTop: 5,
    padding: 4,
    backgroundColor: "#f3f4f6",
    borderWidth: 0.5,
    borderColor: "#6b7280",
  },
});

interface PedidoPDFProps {
  pedido: Pedido;
}

const PedidoPDF: React.FC<PedidoPDFProps> = ({ pedido }) => {
  // Função para agrupar materiais por conjunto
  const agruparMateriais = () => {
    const gruposConjuntos: { [key: string]: PedidoItem[] } = {};
    const materiaisIndividuais: PedidoItem[] = [];

    // Separar materiais por conjunto ou individuais
    pedido.materiais.forEach(material => {
      const conjuntoMatch = material.nome.match(/^\[CONJUNTO:\s*([^\]]+)\]/);
      
      if (conjuntoMatch) {
        const nomeConjunto = conjuntoMatch[1].trim();
        if (!gruposConjuntos[nomeConjunto]) {
          gruposConjuntos[nomeConjunto] = [];
        }
        gruposConjuntos[nomeConjunto].push(material);
      } else {
        materiaisIndividuais.push(material);
      }
    });

    return { gruposConjuntos, materiaisIndividuais };
  };

  const { gruposConjuntos, materiaisIndividuais } = agruparMateriais();
  
  // Calcular número total de linhas para responsividade
  const numLinhasConjuntos = Object.keys(gruposConjuntos).length * 2; // Cada conjunto ocupa 2 linhas (título + itens)
  const numLinhasIndividuais = materiaisIndividuais.length;
  const numItens = numLinhasConjuntos + numLinhasIndividuais;
  
  const isLongTable = numItens > 15; // Tabela longa
  const isVeryLongTable = numItens > 25; // Tabela muito longa

  // Função para quebrar texto longo
  const breakLongText = (text: string, maxLength: number = 60) => {
    if (!text) return "";
    // Quebra palavras muito longas inserindo espaços
    return text.replace(new RegExp(`(.{${maxLength}})`, 'g'), '$1 ');
  };

  // Estilos dinâmicos baseados no tamanho da tabela
  const dynamicStyles = {
    // Reduz espaçamentos para tabelas longas (menos agressivo)
    headerMargin: isVeryLongTable ? 3 : isLongTable ? 4 : 5,
    sectionPadding: isVeryLongTable ? 3 : isLongTable ? 4 : 5,
    sectionMargin: isVeryLongTable ? 2 : isLongTable ? 3 : 3,

    // Ajusta tamanhos de fonte (menos agressivo)
    titleSize: isVeryLongTable ? 8 : isLongTable ? 8.5 : 9,
    textSize: isVeryLongTable ? 6 : isLongTable ? 6.5 : 7,
    tableTextSize: isVeryLongTable ? 6 : isLongTable ? 6.5 : 7,
    tableHeaderSize: isVeryLongTable ? 7 : isLongTable ? 7.5 : 8,

    // Ajusta altura das células (menos agressivo)
    cellPadding: isVeryLongTable ? 1.5 : isLongTable ? 2 : 2.5,

    // Controla se mostra seções opcionais (menos restritivo)
    showClausulas: numItens <= 30, // Aumenta o limite
    compactResponsabilities: numItens > 20, // Compacta só após 20 itens
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={[styles.header, { marginBottom: dynamicStyles.headerMargin }]}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {logoBase64 && <Image src={logoBase64} style={{ width: 40, height: 40 }} />}
          <View style={styles.empresaInfo}>
            <Text style={styles.empresaNome}>
              FLAVINHO Espaço Locações & Festa
            </Text>
            <Text style={styles.empresaContato}>joaoflavio.20@hotmail.com</Text>
            <Text style={styles.empresaContato}>(62) 3273-4463 • (62) 99137-9037</Text>
            <Text style={styles.empresaContato}>CNPJ 25.192.935/0001-48 PIX</Text>
            <Text style={styles.empresaContato}>Av. Bela Vista Qd. 18 Lt. 03 - Ap. de Goiânia - GO</Text>
          </View>
          <View style={{ alignItems: "center" }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={qrcodeBase64} style={{ width: 80, height: 80 }} />
            <Text style={{ fontWeight: "bold", fontSize: 8, marginTop: 2, textAlign: "center", color: "#1e40af" }}>
              PEDIDO Nº {pedido.numero}
            </Text>
          </View>
        </View>

        <Text style={[styles.titleCenterRed, { fontSize: dynamicStyles.titleSize }]}>ATENÇÃO</Text>
        <Text style={[styles.subTextCenterRed, { fontSize: dynamicStyles.textSize }]}>
          *TODOS OS MATERIAIS DEVERÃO SER CONFERIDOS PELO CLIENTE NO RECEBIMENTO DO MESMO.
        </Text>
        <Text style={[styles.subTextCenterRed, { fontSize: dynamicStyles.textSize }]}>
          OBS.: QUALQUER DEFEITO NOS MESMOS SERÁ COBRADO O VALOR DO MESMO OU REPOSIÇÃO COM OUTRO DO MESMO MODELO.
        </Text>

        {/* Cláusulas aparecem até 30 itens */}
        {dynamicStyles.showClausulas && (
          <>
            <Text style={[styles.titleCenter, { fontSize: dynamicStyles.titleSize }]}>CLÁUSULAS DO CONTRATO</Text>
            <View style={[styles.clausulas, {
              padding: dynamicStyles.sectionPadding,
              marginVertical: dynamicStyles.sectionMargin
            }]}>
              {["O material será cobrado aluguel de 12 em 12 horas", "Somente materiais de cozinha receberão limpos e deverão ser devolvidos limpos. Caso contrário, será cobrada taxa de limpeza", "O material só será recebido em perfeito estado", "Todos os materiais deverão ser conferidos. Não aceitamos reclamações posteriores", "O depósito é feito pelo cliente qualificado mediante quitação devida recebida", "O material alugado segue o art. 1256 do CC e responsabilidade conforme art. 901-902 CPC", "Material danificado poderá ser substituído por outro igual. Caso contrário, será cobrado o valor integral do item", "Materiais cancelados na semana do evento é cobrado uma multa de 30% do que foi cancelado"].map((cl, i) => (
                <Text key={i} style={[styles.clausulaItem, { fontSize: dynamicStyles.textSize }]}>{`${i + 1}. ${cl}`}</Text>
              ))}
            </View>
          </>
        )}

        <Text style={[styles.titleCenter, { fontSize: dynamicStyles.titleSize }]}>CONTRATO DE LOCAÇÃO</Text>

        <View style={[styles.contratoSection, {
          padding: dynamicStyles.sectionPadding,
          marginVertical: dynamicStyles.sectionMargin
        }]}>
          <View
            style={{
              fontSize: dynamicStyles.textSize,
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <View style={{ width: "48%" }}>
              <Text style={{ marginBottom: 1, fontSize: dynamicStyles.textSize }}>
                <Text style={{ fontWeight: "bold", color: "#1f2937" }}>DATA LOCAÇÃO: </Text>
                <Text style={{ color: "#374151" }}>{formatDateBR(pedido.data_locacao)}</Text>
              </Text>
              <Text style={{ marginBottom: 1, fontSize: dynamicStyles.textSize }}>
                <Text style={{ fontWeight: "bold", color: "#1f2937" }}>CLIENTE: </Text>
                <Text style={{ color: "#374151" }}>{pedido.cliente}</Text>
              </Text>
              <Text style={{ marginBottom: 1, fontSize: dynamicStyles.textSize }}>
                <Text style={{ fontWeight: "bold", color: "#1f2937" }}>LOCAL DO EVENTO: </Text>
                <Text style={{ color: "#374151" }}>{pedido.endereco}</Text>
              </Text>
              <Text style={{ marginBottom: 1, fontSize: dynamicStyles.textSize }}>
                <Text style={{ fontWeight: "bold", color: "#1f2937" }}>ENDEREÇO RESIDENCIAL: </Text>
                <Text style={{ color: "#374151" }}>{pedido.residencial}</Text>
              </Text>
            </View>

            <View style={{ width: "48%" }}>
              <Text style={{ marginBottom: 1, fontSize: dynamicStyles.textSize }}>
                <Text style={{ fontWeight: "bold", color: "#1f2937" }}>DATA EVENTO: </Text>
                <Text style={{ color: "#374151" }}>{formatDateBR(pedido.data_evento)}</Text>
              </Text>
              <Text style={{ marginBottom: 1, fontSize: dynamicStyles.textSize }}>
                <Text style={{ fontWeight: "bold", color: "#1f2937" }}>DATA DEVOLUÇÃO: </Text>
                <Text style={{ color: "#374151" }}>{formatDateBR(pedido.data_devolucao)}</Text>
              </Text>
              <Text style={{ marginBottom: 1, fontSize: dynamicStyles.textSize }}>
                <Text style={{ fontWeight: "bold", color: "#1f2937" }}>NÚMERO DE CELULAR: </Text>
                <Text style={{ color: "#374151" }}>{formatTelefoneBR(pedido.telefone)}</Text>
              </Text>
              <Text style={{ marginBottom: 1, fontSize: dynamicStyles.textSize }}>
                <Text style={{ fontWeight: "bold", color: "#1f2937" }}>PONTO DE REFERÊNCIA: </Text>
                <Text style={{ color: "#374151" }}>{pedido.referencia}</Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.colQuant, { fontSize: dynamicStyles.tableHeaderSize }, styles.tableHeaderText]}>QUANT.</Text>
            <Text style={[styles.tableCell, styles.colMaterial, { fontSize: dynamicStyles.tableHeaderSize }, styles.tableHeaderText]}>MATERIAL</Text>
            <Text style={[styles.tableCell, styles.colValorUnit, { fontSize: dynamicStyles.tableHeaderSize }, styles.tableHeaderText]}>VALOR UNIT.</Text>
            <Text style={[styles.tableCell, styles.colValorTotal, { fontSize: dynamicStyles.tableHeaderSize }, styles.tableHeaderText]}>VALOR TOTAL</Text>
          </View>
          
          {/* Renderizar conjuntos agrupados */}
          {Object.entries(gruposConjuntos).map(([nomeConjunto, itensConjunto], conjuntoIndex) => {
            // Calcular valores do conjunto
            const quantidadeConjunto = itensConjunto[0]?.quantidade || 1;
            const valorTotalConjunto = itensConjunto.reduce((total, item) => total + (item.valor_total || 0), 0);
            const valorUnitarioConjunto = valorTotalConjunto / quantidadeConjunto;
            
            return (
              <React.Fragment key={`conjunto-${conjuntoIndex}`}>
                {/* Linha do cabeçalho do conjunto */}
                <View style={[styles.tableRow, styles.conjuntoHeaderRow]}>
                  <Text style={[
                    styles.tableCell,
                    styles.colQuant,
                    styles.conjuntoHeaderText,
                    { fontSize: dynamicStyles.tableTextSize, padding: dynamicStyles.cellPadding }
                  ]}>
                    {quantidadeConjunto}
                  </Text>
                  <Text style={[
                    styles.tableCell,
                    styles.colMaterial,
                    styles.conjuntoHeaderText,
                    { fontSize: dynamicStyles.tableTextSize, padding: dynamicStyles.cellPadding, textAlign: "left" }
                  ]}>
                    [JOGO]: {nomeConjunto}
                  </Text>
                  <Text style={[
                    styles.tableCell,
                    styles.colValorUnit,
                    styles.conjuntoHeaderText,
                    { fontSize: dynamicStyles.tableTextSize, padding: dynamicStyles.cellPadding }
                  ]}>
                    {formatarMoedaDeCentavos(valorUnitarioConjunto)}
                  </Text>
                  <Text style={[
                    styles.tableCell,
                    styles.colValorTotal,
                    styles.conjuntoHeaderText,
                    { fontSize: dynamicStyles.tableTextSize, padding: dynamicStyles.cellPadding }
                  ]}>
                    {formatarMoedaDeCentavos(valorTotalConjunto)}
                  </Text>
                </View>
                
                {/* Linhas dos itens do conjunto */}
                {itensConjunto.map((item, itemIndex) => {
                  const nomeItem = item.nome.replace(/^\[CONJUNTO:\s*[^\]]+\]\s*/, '');
                  return (
                    <View key={`item-${conjuntoIndex}-${itemIndex}`} style={[styles.tableRow, styles.conjuntoItemRow]}>
                      <Text style={[
                        styles.tableCell,
                        styles.colQuant,
                        styles.conjuntoItemText,
                        { fontSize: dynamicStyles.tableTextSize - 0.5, padding: dynamicStyles.cellPadding }
                      ]}>
                        {'-> '}{item.quantidade}
                      </Text>
                      <Text style={[
                        styles.tableCell,
                        styles.colMaterial,
                        styles.conjuntoItemText,
                        { fontSize: dynamicStyles.tableTextSize - 0.5, padding: dynamicStyles.cellPadding, textAlign: "left", paddingLeft: 12 }
                      ]}>
                        {nomeItem}
                      </Text>
                      <Text style={[
                        styles.tableCell,
                        styles.colValorUnit,
                        styles.conjuntoItemText,
                        { fontSize: dynamicStyles.tableTextSize - 0.5, padding: dynamicStyles.cellPadding }
                      ]}>
                        -
                      </Text>
                      <Text style={[
                        styles.tableCell,
                        styles.colValorTotal,
                        styles.conjuntoItemText,
                        { fontSize: dynamicStyles.tableTextSize - 0.5, padding: dynamicStyles.cellPadding }
                      ]}>
                        -
                      </Text>
                    </View>
                  );
                })}
              </React.Fragment>
            );
          })}
          
          {/* Renderizar materiais individuais */}
          {materiaisIndividuais.map((mat, i) => (
            <View key={`individual-${i}`} style={styles.tableRow}>
              <Text style={[
                styles.tableCell,
                styles.colQuant,
                { fontSize: dynamicStyles.tableTextSize, padding: dynamicStyles.cellPadding },
                i % 2 === 0 ? styles.tableCellEven : styles.tableCellOdd
              ]}>
                {mat.quantidade}
              </Text>
              <Text style={[
                styles.tableCell,
                styles.colMaterial,
                { fontSize: dynamicStyles.tableTextSize, padding: dynamicStyles.cellPadding, textAlign: "left" },
                i % 2 === 0 ? styles.tableCellEven : styles.tableCellOdd
              ]}>
                {mat.nome}
              </Text>
              <Text style={[
                styles.tableCell,
                styles.colValorUnit,
                { fontSize: dynamicStyles.tableTextSize, padding: dynamicStyles.cellPadding },
                i % 2 === 0 ? styles.tableCellEven : styles.tableCellOdd
              ]}>
                {formatarMoedaDeCentavos(mat.valor_unit || 0)}
              </Text>
              <Text style={[
                styles.tableCell,
                styles.colValorTotal,
                { fontSize: dynamicStyles.tableTextSize, padding: dynamicStyles.cellPadding },
                i % 2 === 0 ? styles.tableCellEven : styles.tableCellOdd
              ]}>
                {formatarMoedaDeCentavos(mat.valor_total || 0)}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.totaisSection, {
          marginTop: dynamicStyles.sectionMargin,
          padding: dynamicStyles.sectionPadding
        }]}>
          <Text style={{ 
            fontWeight: "bold", 
            fontSize: dynamicStyles.titleSize + 1, 
            marginBottom: 4, 
            color: "#1f2937", 
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 0.5
          }}>
            RESUMO FINANCEIRO
          </Text>
          
          <View style={{
            borderWidth: 1,
            borderColor: "#22c55e",
            backgroundColor: "#ffffff",
            padding: dynamicStyles.sectionPadding + 1,
            borderRadius: 4
          }}>
            {/* Valor Bruto */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 2,
              borderBottomWidth: 0.5,
              borderBottomColor: "#e5e7eb",
              marginBottom: 2
            }}>
              <Text style={{ 
                fontSize: dynamicStyles.textSize + 1, 
                fontWeight: "bold",
                color: "#374151" 
              }}>
                TOTAL BRUTO:
              </Text>
              <Text style={{ 
                fontSize: dynamicStyles.titleSize, 
                fontWeight: "bold",
                color: "#1f2937" 
              }}>
                {formatarMoedaDeCentavos(pedido.valor_total)}
              </Text>
            </View>
            
            {/* Mostrar desconto se houver */}
            {pedido.desconto_tipo && pedido.valor_desconto && pedido.valor_desconto > 0 && (
              <>
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 2,
                  borderBottomWidth: 0.5,
                  borderBottomColor: "#e5e7eb",
                  marginBottom: 2,
                  backgroundColor: "#fef2f2",
                  paddingHorizontal: 3,
                  marginHorizontal: -3
                }}>
                  <Text style={{ 
                    fontSize: dynamicStyles.textSize + 1, 
                    fontWeight: "bold",
                    color: "#dc2626" 
                  }}>
                    DESCONTO ({pedido.desconto_tipo === 'porcentagem' ? `${pedido.desconto_valor}%` : 'VALOR FIXO'}):
                  </Text>
                  <Text style={{ 
                    fontSize: dynamicStyles.titleSize, 
                    fontWeight: "bold",
                    color: "#dc2626" 
                  }}>
                    -{formatarMoedaDeCentavos(pedido.valor_desconto)}
                  </Text>
                </View>
                
                <View style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 2,
                  borderBottomWidth: 1,
                  borderBottomColor: "#22c55e",
                  marginBottom: 3,
                  backgroundColor: "#f0fdf4",
                  paddingHorizontal: 3,
                  marginHorizontal: -3
                }}>
                  <Text style={{ 
                    fontSize: dynamicStyles.textSize + 1, 
                    fontWeight: "bold",
                    color: "#059669" 
                  }}>
                    TOTAL COM DESCONTO:
                  </Text>
                  <Text style={{ 
                    fontSize: dynamicStyles.titleSize + 1, 
                    fontWeight: "bold",
                    color: "#059669" 
                  }}>
                    {formatarMoedaDeCentavos(pedido.valor_final || pedido.valor_total)}
                  </Text>
                </View>
              </>
            )}
            
            {/* Valor Pago */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 2,
              marginBottom: 2
            }}>
              <Text style={{ 
                fontSize: dynamicStyles.textSize + 1, 
                fontWeight: "bold",
                color: "#374151" 
              }}>
                VALOR PAGO:
              </Text>
              <Text style={{ 
                fontSize: dynamicStyles.titleSize, 
                fontWeight: "bold",
                color: "#059669" 
              }}>
                {formatarMoedaDeCentavos(pedido.valor_pago)}
              </Text>
            </View>
            
            {/* Valor a Pagar - Destaque especial */}
            <View style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 4,
              backgroundColor: (pedido.valor_deve || 0) > 0 ? "#fef2f2" : "#f0fdf4",
              marginHorizontal: -3,
              paddingHorizontal: 3,
              borderWidth: 1,
              borderColor: (pedido.valor_deve || 0) > 0 ? "#dc2626" : "#22c55e",
              borderRadius: 2
            }}>
              <Text style={{ 
                fontSize: dynamicStyles.titleSize, 
                fontWeight: "bold",
                color: "#1f2937",
                textTransform: "uppercase",
                letterSpacing: 0.5
              }}>
                VALOR A PAGAR:
              </Text>
              <Text style={{ 
                fontSize: dynamicStyles.titleSize + 2, 
                fontWeight: "bold",
                color: (pedido.valor_deve || 0) > 0 ? "#dc2626" : "#059669"
              }}>
                {formatarMoedaDeCentavos(pedido.valor_deve)}
              </Text>
            </View>
          </View>
        </View>

        {/* RESPONSABILIDADES - Layout dinâmico */}
        <View style={[styles.responsabilidadesSection, {
          marginTop: dynamicStyles.sectionMargin,
          padding: dynamicStyles.sectionPadding
        }]}>
          <Text style={{ fontWeight: "bold", fontSize: dynamicStyles.titleSize, marginBottom: 2, color: "#1f2937" }}>RESPONSABILIDADES</Text>

          {dynamicStyles.compactResponsabilities ? (
            // Layout compacto para tabelas longas
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 1 }}>
              <Text style={{ fontSize: dynamicStyles.textSize, width: "48%", fontWeight: "bold", color: "#1f2937" }}>
                RESP. ENTREGOU: {pedido.resp_entregou || "___________"} - DATA: {pedido.data_entregou ? formatDateBR(pedido.data_entregou) : "___/___/___"} - HORA: {pedido.hora_entregou || "___:___"}
              </Text>
              {/* <Text style={{ fontSize: dynamicStyles.textSize, width: "48%", fontWeight: "bold", color: "#1f2937" }}>
                RESP. RECEBEU: {pedido.resp_recebeu || "___________"} - DATA: {pedido.data_recebeu ? formatDateBR(pedido.data_recebeu) : "___/___/___"} - HORA: {pedido.hora_recebeu || "___:___"}
              </Text> */}
              <Text style={{ fontSize: dynamicStyles.textSize, width: "48%", fontWeight: "bold", color: "#1f2937" }}>
                RESP. BUSCOU: {pedido.resp_buscou || "___________"} - DATA: {pedido.data_buscou ? formatDateBR(pedido.data_buscou) : "___/___/___"} - HORA: {pedido.hora_buscou || "___:___"}
              </Text>
              <Text style={{ fontSize: dynamicStyles.textSize, width: "48%", fontWeight: "bold", color: "#1f2937" }}>
                CONF. FORRO: {pedido.resp_forro || "_______"} - DATA: {pedido.data_forro ? formatDateBR(pedido.data_forro) : "___/___/___"} - HORA: {pedido.hora_forro || "___:___"}
              </Text>
              <Text style={{ fontSize: dynamicStyles.textSize, width: "98%", fontWeight: "bold", color: "#1f2937" }}>
                CONF. UTENSÍLIO: {pedido.resp_utensilio || "___________"} - DATA: {pedido.data_utensilio ? formatDateBR(pedido.data_utensilio) : "___/___/___"} - HORA: {pedido.hora_utensilio || "___:___"}
              </Text>
            </View>
          ) : (
            // Layout normal para tabelas pequenas
            <>
              <View style={[styles.responsabilidadeItem, { paddingVertical: dynamicStyles.cellPadding }]}>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "35%", fontWeight: "bold", color: "#374151" }}>
                  RESP. ENTREGOU:
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "35%", color: "#1f2937" }}>
                  {pedido.resp_entregou || "____________________"}
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "15%", textAlign: "center", color: "#374151", fontWeight: "bold" }}>
                  DATA: {pedido.data_entregou ? formatDateBR(pedido.data_entregou) : "___/___/___"}
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "15%", textAlign: "right", color: "#374151", fontWeight: "bold" }}>
                  HORA: {pedido.hora_entregou || "___:___"}
                </Text>
              </View>

              {/* <View style={[styles.responsabilidadeItem, { paddingVertical: dynamicStyles.cellPadding }]}>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "35%", fontWeight: "bold", color: "#374151" }}>
                  RESP. RECEBEU:
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "35%", color: "#1f2937" }}>
                  {pedido.resp_recebeu || "____________________"}
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "15%", textAlign: "center", color: "#374151", fontWeight: "bold" }}>
                  DATA: {pedido.data_recebeu ? formatDateBR(pedido.data_recebeu) : "___/___/___"}
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "15%", textAlign: "right", color: "#374151", fontWeight: "bold" }}>
                  HORA: {pedido.hora_recebeu || "___:___"}
                </Text>
              </View> */}

              <View style={[styles.responsabilidadeItem, { paddingVertical: dynamicStyles.cellPadding }]}>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "35%", fontWeight: "bold", color: "#374151" }}>
                  RESP. BUSCOU:
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "35%", color: "#1f2937" }}>
                  {pedido.resp_buscou || "____________________"}
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "15%", textAlign: "center", color: "#374151", fontWeight: "bold" }}>
                  DATA: {pedido.data_buscou ? formatDateBR(pedido.data_buscou) : "___/___/___"}
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "15%", textAlign: "right", color: "#374151", fontWeight: "bold" }}>
                  HORA: {pedido.hora_buscou || "___:___"}
                </Text>
              </View>

              <View style={[styles.responsabilidadeItem, { paddingVertical: dynamicStyles.cellPadding }]}>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "35%", fontWeight: "bold", color: "#374151" }}>
                  RESP. CONF. FORRO:
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "35%", color: "#1f2937" }}>
                  {pedido.resp_forro || "____________________"}
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "15%", textAlign: "center", color: "#374151", fontWeight: "bold" }}>
                  DATA: {pedido.data_forro ? formatDateBR(pedido.data_forro) : "___/___/___"}
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "15%", textAlign: "right", color: "#374151", fontWeight: "bold" }}>
                  HORA: {pedido.hora_forro || "___:___"}
                </Text>
              </View>

              <View style={[styles.responsabilidadeItem, { paddingVertical: dynamicStyles.cellPadding }]}>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "35%", fontWeight: "bold", color: "#374151" }}>
                  RESP. CONF. UTENSÍLIO:
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "35%", color: "#1f2937" }}>
                  {pedido.resp_utensilio || "____________________"}
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "15%", textAlign: "center", color: "#374151", fontWeight: "bold" }}>
                  DATA: {pedido.data_utensilio ? formatDateBR(pedido.data_utensilio) : "___/___/___"}
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, width: "15%", textAlign: "right", color: "#374151", fontWeight: "bold" }}>
                  HORA: {pedido.hora_utensilio || "___:___"}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Seção de Observações */}
        <View style={[styles.observacoesSection, {
          marginTop: dynamicStyles.sectionMargin,
          padding: dynamicStyles.sectionPadding
        }]}>
          <Text style={{ fontWeight: "bold", fontSize: dynamicStyles.titleSize, marginBottom: 2, color: "#1f2937" }}>OBSERVAÇÕES</Text>
          <View style={{
            borderWidth: 0.5,
            borderColor: "#6b7280",
            padding: dynamicStyles.sectionPadding,
            minHeight: 30,
            backgroundColor: "#f9fafb"
          }}>
            <Text style={{
              fontSize: dynamicStyles.textSize,
              color: "#374151",
              lineHeight: 1.4
            }}>
              {pedido.obs ?
                breakLongText(pedido.obs, 80)
                : "_____________________________________________________________________________________________________________________________________________"
              }
            </Text>
            {!pedido.obs && (
              <>
                <Text style={{ fontSize: dynamicStyles.textSize, color: "#9ca3af", marginTop: 3 }}>
                  _____________________________________________________________________________________________________________________________________________
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, color: "#9ca3af", marginTop: 3 }}>
                  _____________________________________________________________________________________________________________________________________________
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, color: "#9ca3af", marginTop: 3 }}>
                  _____________________________________________________________________________________________________________________________________________
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, color: "#9ca3af", marginTop: 3 }}>
                  _____________________________________________________________________________________________________________________________________________
                </Text>
                <Text style={{ fontSize: dynamicStyles.textSize, color: "#9ca3af", marginTop: 3 }}>
                  _____________________________________________________________________________________________________________________________________________
                </Text>
              </>
            )}
          </View>
        </View>

        <Text
          style={{
            fontWeight: "bold",
            fontSize: dynamicStyles.textSize,
            marginTop: dynamicStyles.sectionMargin,
            textAlign: "center",
            color: "#1f2937",
            backgroundColor: "#fef3c7",
            padding: dynamicStyles.sectionPadding,
            borderWidth: 0.5,
            borderColor: "#f59e0b",
          }}
        >
          CERTIFICO QUE EU CONFERI TODO MATERIAL E ME RESPONSABILIZO POR TODO E QUALQUER MATERIAL
          PRESCRITO NESTE CONTRATO.
        </Text>

        <View style={[styles.assinaturaSection, {
          marginTop: dynamicStyles.sectionMargin,
          padding: dynamicStyles.sectionPadding
        }]}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: dynamicStyles.textSize, fontWeight: "bold", color: "#374151" }}>
              ASSINATURA: ____________________________________________________________
            </Text>
            <Text style={{ fontSize: dynamicStyles.textSize, fontWeight: "bold", color: "#374151" }}>
              CPF/CNPJ/RG: {formatCpfCnpjBR(pedido.cpf)}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PedidoPDF;