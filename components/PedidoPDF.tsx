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
import { formatTelefoneBR } from "@/lib/formatNumber";
import { formatCpfCnpjBR } from "@/lib/formatCpfCnpj";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 9,
    fontFamily: "Helvetica",
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  empresaInfo: {
    flex: 1,
    paddingLeft: 8,
  },
  titleCenter: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 4,
  },
  subTextCenter: {
    fontSize: 8,
    textAlign: "center",
  },
  clausulas: {
    marginVertical: 4,
  },
  clausulaItem: {
    fontSize: 8,
    marginBottom: 1,
    textAlign: "justify",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 6,
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
    padding: 2,
    textAlign: "center",
  },
  colQuant: { width: "15%" },
  colMaterial: { width: "45%" },
  colValorUnit: { width: "20%" },
  colValorTotal: { width: "20%" },
});

interface PedidoPDFProps {
  pedido: Pedido;
}

const PedidoPDF: React.FC<PedidoPDFProps> = ({ pedido }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {logoBase64 && <Image src={logoBase64} style={{ width: 60, height: 60 }} />}
        <Image src={qrcodeBase64} style={{ width: 60, height: 60 }} />
        <View style={styles.empresaInfo}>
          <Text style={{ fontWeight: "bold", fontSize: 9 }}>
            FLAVINHO Espaço Locações & Festa
          </Text>
          <Text>joaoflavio.20@hotmail.com</Text>
          <Text>(62) 3273-4463  (62) 99137-9037</Text>
          <Text>CNPJ 25.192.935/0001-48 PIX</Text>
          <Text>Av. Bela Vista Qd. 18 Lt. 03 - Ap. de Goiânia - GO</Text>
        </View>
      </View>

      <Text style={styles.titleCenter}>ATENÇÃO</Text>
      <Text style={styles.subTextCenter}>
        *TODOS OS MATERIAIS DEVERÃO SER CONFERIDOS PELO CLIENTE NO RECEBIMENTO DO MESMO.
      </Text>
      <Text style={{ ...styles.subTextCenter, fontSize: 7, marginBottom: 4 }}>
        OBS.: QUALQUER DEFEITO NOS MESMOS SERÁ COBRADO O VALOR DO MESMO OU REPOSIÇÃO COM OUTRO DO MESMO MODELO.
      </Text>

      <Text style={styles.titleCenter}>CLÁUSULAS DO CONTRATO</Text>
      <View style={styles.clausulas}>
        {["O material será cobrado aluguel de 12 em 12 horas", "Somente materiais de cozinha receberão limpos e deverão ser devolvidos limpos. Caso contrário, será cobrada taxa de limpeza", "O material só será recebido em perfeito estado", "Todos os materiais deverão ser conferidos. Não aceitamos reclamações posteriores", "O depósito é feito pelo cliente qualificado mediante quitação devida recebida", "O material alugado segue o art. 1256 do CC e responsabilidade conforme art. 901-902 CPC", "Material danificado poderá ser substituído por outro igual. Caso contrário, será cobrado o valor integral do item"].map((cl, i) => (
          <Text key={i} style={styles.clausulaItem}>{`${i + 1} - ${cl}`}</Text>
        ))}
      </View>

      <Text style={styles.titleCenter}>CONTRATO DE LOCAÇÃO</Text>

      <View
        style={{
          marginTop: 4,
          fontSize: 8,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <View style={{ width: "48%" }}>
          <Text>
            <Text style={{ fontWeight: "bold" }}>DATA LOCAÇÃO: </Text>
            {formatDateBR(pedido.data_locacao)}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>CLIENTE: </Text>
            {pedido.cliente}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>LOCAL: </Text>
            {pedido.endereco}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>RESIDENCIAL: </Text>
            {pedido.residencial}
          </Text>
        </View>

        <View style={{ width: "48%" }}>
          <Text>
            <Text style={{ fontWeight: "bold" }}>EVENTO: </Text>
            {formatDateBR(pedido.data_evento)}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>DEVOLUÇÃO: </Text>
            {formatDateBR(pedido.data_devolucao)}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>CELULAR: </Text>
            {formatTelefoneBR(pedido.telefone)}
          </Text>
          <Text>
            <Text style={{ fontWeight: "bold" }}>REFERÊNCIA: </Text>
            {pedido.referencia}
          </Text>
        </View>

      </View>

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
            <Text style={[styles.tableCell, styles.colValorUnit]}>
              {mat.valor_unit?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
            <Text style={[styles.tableCell, styles.colValorTotal]}>
              {mat.valor_total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Text>
          </View>
        ))}
      </View>
      <Text style={{ fontWeight: "bold", fontSize: 9, marginTop: 4, textAlign: "right" }}> TOTAL GERAL: R$ {pedido.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>

      {/* RESPONSABILIDADES - MANUAL */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: "bold", fontSize: 9, marginBottom: 4 }}>RESPONSABILIDADES</Text>
        {["ENTREGOU", "RECEBEU", "BUSCOU", "CONFERIU FORRO", "CONFERIU UTENSÍLIO"].map((label, index) => (
          <View
            key={index}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 3,
              paddingHorizontal: 6,
            }}
          >
            <Text style={{ fontSize: 8, width: "35%" }}>{label}: ____________________</Text>
            <Text style={{ fontSize: 8, width: "30%", textAlign: "center" }}>Data: ____/____/____</Text>
            <Text style={{ fontSize: 8, width: "30%", textAlign: "right" }}>Horário: ____:____</Text>
          </View>
        ))}
      </View>

      <Text
        style={{
          fontWeight: "bold",
          fontSize: 10,
          marginTop: 8,
          textAlign: "center",
        }}
      >
        CERTIFICO QUE EU CONFERI TODO MATERIAL E ME RESPONSABILIZO POR TODO E QUALQUER MATERIAL
        PRESCRITO NESTE CONTRATO.
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 12,
          paddingHorizontal: 10,
        }}
      >
        <Text style={{ fontSize: 9, fontWeight: "bold" }}>
          ASSINATURA: ______________________________________
        </Text>
        <Text style={{ fontSize: 9, fontWeight: "bold" }}>
          CPF/CNPJ/RG: {formatCpfCnpjBR(pedido.cpf)}
        </Text>
      </View>
    </Page>
  </Document>
);

export default PedidoPDF;