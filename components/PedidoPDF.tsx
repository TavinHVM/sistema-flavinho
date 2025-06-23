// @ts-nocheck
import React from "react";
import { Document, Page, View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import { Pedido } from "../types/Pedido";
import logoBase64 from "./logoBase64";

const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 2,
    marginTop: 24, // margem superior aumentada
    marginBottom: 10
  },
  section: {
    marginVertical: 2,
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginVertical: 6,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    flexDirection: 'column',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#222',
    color: '#fff',
    fontWeight: 'bold',
    padding: 2,
    textAlign: 'center',
  },
  logo: {
    width: 80, // ajuste conforme necessário
    height: 80, // ajuste conforme necessário
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 2,
    textAlign: 'center',
  },
  obs: {
    fontSize: 8,
    color: '#444',
    marginTop: 4,
  },
  assinatura: {
    marginTop: 16,
    fontSize: 10,
    textAlign: 'left',
  },
});

interface PedidoPDFProps {
  pedido: Pedido;
}

const PedidoPDF: React.FC<PedidoPDFProps> = ({ pedido }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        {logoBase64 ? (
          <Image src={logoBase64} style={styles.logo} />
        ) : (
          <View style={{ width: 70, height: 40, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }}>
            <Text>LOGO</Text>
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 12 }}>FLAVINHO Espaço Locações & Festa</Text>
          <Text>CNPJ 25.192.935/0001-48 PIX</Text>
          <Text>Av. Bela Vista Qd. 18 Lt. 03 - Parque Trindade I - Ap. de Goiânia - GO</Text>
        </View>
      </View>
      <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 10, marginBottom: 2 }}>
        ATENÇÃO: TODOS OS MATERIAIS DEVEM SER CONFERIDOS PELO CLIENTE NO RECEBIMENTO DO MESMO.
      </Text>
      <Text style={styles.obs}>
        OBS.: QUALQUER DEFEITO NOS MESMOS SERÁ COBRADO O VALOR DO MESMO OU REPOSIÇÃO COM OUTRO DO MESMO MODELO.
      </Text>
      <Text style={styles.title}>CONTRATO DE LOCAÇÃO</Text>
      <View style={styles.section}>
        <Text>DATA DA LOCAÇÃO: {pedido.data_locacao}   DATA DO EVENTO: {pedido.data_evento}   DEVOLVER: {pedido.data_devolucao}</Text>
        <Text>NOME: {pedido.cliente}   CPF: {pedido.cpf}</Text>
        <Text>LOCAL DO EVENTO: {pedido.endereco}   FONE CELULAR: {pedido.telefone}</Text>
        <Text>END. RESIDENCIAL: {pedido.residencial}   FONE REFERÊNCIA: {pedido.referencia}</Text>
      </View>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={styles.tableColHeader}>QUANT.</Text>
          <Text style={styles.tableColHeader}>MATERIAL</Text>
          <Text style={styles.tableColHeader}>VALOR UNIT.</Text>
          <Text style={styles.tableColHeader}>VALOR TOTAL</Text>
        </View>
        {pedido.materiais.map((mat, idx) => (
          <View style={styles.tableRow} key={idx}>
            <Text style={styles.tableCol}>{mat.quantidade}</Text>
            <Text style={styles.tableCol}>{mat.nome}</Text>
            <Text style={styles.tableCol}>R$ {mat.valor_unit?.toFixed(2)}</Text>
            <Text style={styles.tableCol}>R$ {mat.valor_total?.toFixed(2)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text>RESP. ENTREGOU: {pedido.responsavel_entregou}   DATA: {pedido.data_entregou}   HORÁRIO: ______   DESCONTO: R$ {pedido.desconto?.toFixed(2)}</Text>
        <Text>RESP. RECEBEU: {pedido.responsavel_recebeu}   DATA: {pedido.data_recebeu}   HORÁRIO: ______</Text>
        <Text>RESP. BUSCOU: {pedido.responsavel_buscou}   DATA: {pedido.data_buscou}   HORÁRIO: ______   TOTAL: R$ {pedido.valor_total?.toFixed(2)}</Text>
        <Text>RESP. CONFERIU FORRO: {pedido.responsavel_conferiu_forro}</Text>
        <Text>RESP. CONFERIU UTENSÍLIO: {pedido.responsavel_conferiu_utensilio}</Text>
      </View>
      <Text style={styles.assinatura}>
        CERTIFICO QUE EU CONFERI TODO MATERIAL E RESPONSABILIZO POR TODO E QUALQUER MATERIAL PRESCRITO NESTE CONTRATO.
      </Text>
      <Text style={styles.assinatura}>
        ASSINATURA: ____________________________   CPF/RG: ____________________________
      </Text>
    </Page>
  </Document>
);

export default PedidoPDF;
