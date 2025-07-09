import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Pedido } from "../types/Pedido";
import { formatDateBR } from "../lib/formatDate";
import logoBase64 from "./logoBase64";
import qrcodeBase64 from "./qrcodeBase64";

// Estilos atualizados
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  empresaInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  titleCenter: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 8,
  },
  subTextCenter: {
    fontSize: 9,
    textAlign: "center",
  },
  clausulas: {
    marginVertical: 6,
  },
  clausulaItem: {
    fontSize: 9,
    marginBottom: 2,
    textAlign: "justify",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 8,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  tableCell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 4,
    textAlign: "center",
  },
  colQuant: { width: "15%" },
  colMaterial: { width: "45%" },
  colValorUnit: { width: "20%" },
  colValorTotal: { width: "20%" },
  assinatura: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 9,
  },
});

interface PedidoPDFProps {
  pedido: Pedido;
}

const PedidoPDF: React.FC<PedidoPDFProps> = ({ pedido }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        {logoBase64 && <Image src={logoBase64} style={{ width: 70, height: 70 }} />}
        <Image src={qrcodeBase64} style={{ width: 70, height: 70 }} />
        <View style={styles.empresaInfo}>
          <Text style={{ fontWeight: "bold", fontSize: 10 }}>
            FLAVINHO Espaço Locações & Festa
          </Text>
          <Text>joaoflavio.20@hotmail.com</Text>
          <Text>(62) 3273-4463  (62) 99137-9037</Text>
          <Text>CNPJ 25.192.935/0001-48 PIX</Text>
          <Text>Av. Bela Vista Qd. 18 Lt. 03 - Ap. de Goiânia - GO</Text>
        </View>
      </View>

      {/* Atenção */}
      <Text style={styles.titleCenter}>ATENÇÃO</Text>
      <Text style={styles.subTextCenter}>
        *TODOS OS MATERIAIS DEVERÃO SER CONFERIDOS PELO CLIENTE NO RECEBIMENTO DO MESMO.
      </Text>
      <Text style={{ ...styles.subTextCenter, fontSize: 8, marginBottom: 6 }}>
        OBS.: QUALQUER DEFEITO NOS MESMOS SERÁ COBRADO O VALOR DO MESMO OU REPOSIÇÃO COM OUTRO DO MESMO MODELO.
      </Text>

      {/* Cláusulas */}
      <Text style={styles.titleCenter}>CLÁUSULAS DO CONTRATO</Text>
      <View style={styles.clausulas}>
        {[
          "O material será cobrado aluguel de 12 em 12 horas",
          "Somente materiais de cozinha receberão limpos e deverão ser devolvidos limpos. Caso contrário, será cobrada taxa de limpeza",
          "O material só será recebido em perfeito estado",
          "Todos os materiais deverão ser conferidos. Não aceitamos reclamações posteriores",
          "O depósito é feito pelo cliente qualificado mediante quitação devida recebida",
          "O material alugado segue o art. 1256 do CC e responsabilidade conforme art. 901-902 CPC",
          "Material danificado poderá ser substituído por outro igual. Caso contrário, será cobrado o valor integral do item",
        ].map((cl, i) => (
          <Text key={i} style={styles.clausulaItem}>{`${i + 1} - ${cl}`}</Text>
        ))}
      </View>

      {/* Dados do evento / cliente */}
      <Text style={styles.titleCenter}>CONTRATO DE LOCAÇÃO</Text>
      <View style={{ marginTop: 8, fontSize: 9 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>DATA LOCAÇÃO: {formatDateBR(pedido.data_locacao)}</Text>
          <Text>EVENTO: {formatDateBR(pedido.data_evento)}</Text>
          <Text>DEVOLUÇÃO: {formatDateBR(pedido.data_devolucao)}</Text>
        </View>
        <View style={{ height: 6 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>CLIENTE: {pedido.cliente}</Text>
          <Text>CELULAR: {pedido.telefone}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>LOCAL: {pedido.endereco}</Text>
          <Text>REFERÊNCIA: {pedido.referencia}</Text>
        </View>
        <Text>RESIDENCIAL: {pedido.residencial}</Text>
      </View>

      {/* Tabela de materiais */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.colQuant]}>QUANT.</Text>
          <Text style={[styles.tableCell, styles.colMaterial]}>MATERIAL</Text>
          <Text style={[styles.tableCell, styles.colValorUnit]}>VALOR UNIT.</Text>
          <Text style={[styles.tableCell, styles.colValorTotal]}>VALOR TOTAL</Text>
        </View>
        {pedido.materiais.map((mat, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.colQuant]}>{mat.quantidade}</Text>
            <Text style={[styles.tableCell, styles.colMaterial]}>{mat.nome}</Text>
            <Text style={[styles.tableCell, styles.colValorUnit]}>R$ {mat.valor_unit?.toFixed(2)}</Text>
            <Text style={[styles.tableCell, styles.colValorTotal]}>R$ {mat.valor_total?.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Seção de responsáveis */}
      <View style={{ marginTop: 16, padding: 10, borderWidth: 1, borderColor: "#000", borderRadius: 4 }}>
        <Text style={{ fontWeight: "bold", fontSize: 10, marginBottom: 6 }}>RESPONSABILIDADES</Text>

        {[
          {
            label: "ENTREGOU",
            nome: pedido.responsavel_entregou,
            data: formatDateBR(pedido.data_entregou),
            horario: pedido.horario_entregou || "____",
          },
          {
            label: "RECEBEU",
            nome: pedido.responsavel_recebeu,
            data: formatDateBR(pedido.data_recebeu),
            horario: pedido.horario_recebeu || "____",
          },
          {
            label: "BUSCOU",
            nome: pedido.responsavel_buscou,
            data: formatDateBR(pedido.data_buscou),
            horario: pedido.horario_buscou || "____",
          },
        ].map((item, index) => (
          <View key={index} style={{ flexDirection: 'row', marginBottom: 4, flexWrap: 'wrap' }}>
            <Text style={{ fontWeight: "bold", fontSize: 9 }}>{item.label}: </Text>
            <Text style={{ fontSize: 9 }}>{item.nome}</Text>

            <Text style={{ fontWeight: "bold", fontSize: 9, marginLeft: 12 }}>Data: </Text>
            <Text style={{ fontSize: 9 }}>{item.data}</Text>

            <Text style={{ fontWeight: "bold", fontSize: 9, marginLeft: 12 }}>Horário: </Text>
            <Text style={{ fontSize: 9 }}>{item.horario}</Text>
          </View>
        ))}

        {/* Conferência */}
        <View style={{ flexDirection: 'row', marginBottom: 4, flexWrap: 'wrap' }}>
          <Text style={{ fontWeight: "bold", fontSize: 9 }}>CONFERIU FORRO: </Text>
          <Text style={{ fontSize: 9 }}>{pedido.responsavel_conferiu_forro}</Text>

          <Text style={{ fontWeight: "bold", fontSize: 9, marginLeft: 12 }}>CONFERIU UTENSÍLIO: </Text>
          <Text style={{ fontSize: 9 }}>{pedido.responsavel_conferiu_utensilio}</Text>
        </View>

        {/* Desconto */}
        {pedido.desconto !== undefined && pedido.desconto !== null && (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 2 }}>
            <Text style={{ fontWeight: "bold", fontSize: 10 }}>Desconto: </Text>
            <Text style={{ fontSize: 10 }}>R$ {pedido.desconto.toFixed(2)}</Text>
          </View>
        )}

        {/* Total */}
        <View style={{ marginTop: 4, borderTopWidth: 1, borderColor: '#000', paddingTop: 4 }}>
          <Text style={{ fontSize: 10, fontWeight: "bold", textAlign: 'right' }}>
            TOTAL GERAL: R$ {pedido.valor_total?.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Assinatura */}
      <View style={styles.assinatura}>
        <Text>ASSINATURA: ____________________________</Text>
        <Text style={{ marginTop: 4 }}>CPF/RG: ____________________________</Text>
      </View>
    </Page>
  </Document>
);

export default PedidoPDF;
