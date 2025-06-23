// @ts-nocheck
import React from "react";
import { Document, Page, View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import { Pedido } from "../types/Pedido";
import { formatDateBR } from "../lib/formatDate";
import logoBase64 from "./logoBase64";
import qrcodeBase64 from "./qrcodeBase64";

const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoEmpresa: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 4,
  },
  clausulas: {
    fontSize: 10,
    marginVertical: 4,
  },
  section: {
    marginVertical: 2,
    textAlign: 'justify',
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
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    fontWeight: 'bold',
    padding: 2,
    textAlign: 'center',
  },
  tableCol: {
    borderStyle: 'solid',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 2,
    textAlign: 'center',
  },
  assinatura: {
    marginTop: 16,
    fontSize: 10,
    textAlign: 'justify',
  },
  boldLine: {
    marginTop: 4,
    fontSize: 9,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
  }
});

interface PedidoPDFProps {
  pedido: Pedido;
}

const PedidoPDF: React.FC<PedidoPDFProps> = ({ pedido }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {logoBase64 && <Image src={logoBase64} style={{ width: 70, height: 70 }} alt="" />}
        <View style={{ width: 70, height: 70 }}>
          <Image src={qrcodeBase64} style={{ width: 70, height: 70 }} alt="" />
        </View>
        <View style={styles.infoEmpresa}>
          <Text style={{ fontWeight: 'bold', fontSize: 10 }}>FLAVINHO Espaço Locações & Festa</Text>
          <Text>joaoflavio.20@hotmail.com</Text>
          <Text>(62) 3273-4463  (62) 99137-9037</Text>
          <Text>CNPJ 25.192.935/0001-48 PIX</Text>
          <Text>Av. Bela Vista Qd. 18 Lt. 03 - Parque Trindade I - Ap. de Goiânia - GO</Text>
        </View>
      </View>

      {/* Atenção */}
      <Text style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', marginVertical: 4 }}>ATENÇÃO</Text>
      <Text style={{ fontSize: 9, textAlign: 'center' }}>*TODOS OS MATERIAIS DEVERÃO SER CONFERIDOS PELO CLIENTE NO RECEBIMENTO DO MESMO.</Text>
      <Text style={{ fontSize: 8, textAlign: 'center', marginBottom: 2 }}>OBS.: QUALQUER DEFEITO NOS MESMOS SERÁ COBRADO O VALOR DO MESMO OU REPOSIÇÃO COM OUTRO DO MESMO MODELO.</Text>
      <Text style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', marginVertical: 4, marginTop: 16 }}>CLÁUSULAS DO CONTRATO</Text>
      <View style={styles.clausulas}>
        <Text>1 - O material será cobrado aluguel de 12 em 12 horas</Text>
        <Text>2 - Somente materiais de cozinha receberão limpos e deverão devolver limpos(O mesmo não entregue limpo, será cobrado taxa de limpeza)</Text>
        <Text>3 - O material só será recebido em perfeito estado</Text>
        <Text>4 - Todos os materiais deverão ser conferidos, Não aceitamos reclamações posteriores</Text>
        <Text>5 - Deposita ao cliente qualificado, devidamente comprovado através de quitação devida recebida</Text>
        <Text>6 - O material alocado, incide contrato de art. 1256 do CC. Suplantado-se de oposição de responsabilidade do Fide Depositário, exegível conforme art. 901-902 CPC</Text>
        <Text>7 - O material danificado poderá ser substituído por outro do mesmo modelo igual e na mesma. Caso isso não ocorra, será cobrado o valor do produto.</Text>
      </View>

      {/* Dados */}
      <Text style={styles.title}>CONTRATO DE LOCAÇÃO</Text>
      <View style={styles.section}>
        <Text>DATA DA LOCAÇÃO: {formatDateBR(pedido.data_locacao)}   DATA DO EVENTO: {formatDateBR(pedido.data_evento)}   DEVOLVER: {formatDateBR(pedido.data_devolucao)}</Text>
        <Text>NOME: {pedido.cliente}</Text>
        <Text>LOCAL DO EVENTO: {pedido.endereco}   FONE CELULAR: {pedido.telefone}</Text>
        <Text>END. RESIDENCIAL: {pedido.residencial}   FONE REFERÊNCIA: {pedido.referencia}</Text>
      </View>

      {/* Tabela */}
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <Text style={{ ...styles.tableColHeader, width: '15%' }}>QUANT.</Text>
          <Text style={{ ...styles.tableColHeader, width: '45%' }}>MATERIAL</Text>
          <Text style={{ ...styles.tableColHeader, width: '20%' }}>VALOR UNIT.</Text>
          <Text style={{ ...styles.tableColHeader, width: '20%' }}>VALOR TOTAL</Text>
        </View>
        {pedido.materiais.map((mat, idx) => (
          <View style={styles.tableRow} key={idx}>
            <Text style={{ ...styles.tableCol, width: '15%' }}>{mat.quantidade}</Text>
            <Text style={{ ...styles.tableCol, width: '45%' }}>{mat.nome}</Text>
            <Text style={{ ...styles.tableCol, width: '20%' }}>R$ {mat.valor_unit?.toFixed(2)}</Text>
            <Text style={{ ...styles.tableCol, width: '20%' }}>R$ {mat.valor_total?.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      {/* Rodapé */}
      <View style={styles.section}>
        {/* Linha 1: ENTREGOU (esquerda), DATA (centro), HORÁRIO (direita), DESCONTO (direita) */}
        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
          <Text style={{ flex: 2, textAlign: 'left' }}>
            RESP. ENTREGOU: {pedido.responsavel_entregou}
          </Text>
          <Text style={{ flex: 1, textAlign: 'center' }}>
            DATA: {formatDateBR(pedido.data_entregou)}
          </Text>
          <Text style={{ flex: 1, textAlign: 'center' }}>
            HORÁRIO: ______
          </Text>
          <Text style={{ flex: 1, textAlign: 'right' }}>
            DESCONTO: R$ {pedido.desconto?.toFixed(2)}
          </Text>
        </View>
        {/* Linha 2: RECEBEU (esquerda), DATA (centro), HORÁRIO (direita) */}
        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
          <Text style={{ flex: 2, textAlign: 'left' }}>
            RESP. RECEBEU: {pedido.responsavel_recebeu}
          </Text>
          <Text style={{ flex: 1, textAlign: 'center' }}>
            DATA: {formatDateBR(pedido.data_recebeu)}
          </Text>
          <Text style={{ flex: 2, textAlign: 'left' }}>
            HORÁRIO: ______
          </Text>
        </View>
        {/* Linha 3: BUSCOU (esquerda), DATA (centro), HORÁRIO (direita), TOTAL (direita) */}
        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
          <Text style={{ flex: 2, textAlign: 'left' }}>
            RESP. BUSCOU: {pedido.responsavel_buscou}
          </Text>
          <Text style={{ flex: 1, textAlign: 'center' }}>
            DATA: {formatDateBR(pedido.data_buscou)}
          </Text>
          <Text style={{ flex: 1, textAlign: 'center' }}>
            HORÁRIO: ______
          </Text>
          <Text style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>
            TOTAL: R$ {pedido.valor_total?.toFixed(2)}
          </Text>
        </View>
        {/* Linha 4: CONFERIU FORRO */}
        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
          <Text style={{ flex: 1, textAlign: 'left' }}>
            RESP. CONFERIU FORRO: {pedido.responsavel_conferiu_forro}
          </Text>
        </View>
        {/* Linha 5: CONFERIU UTENSÍLIO */}
        <View style={{ flexDirection: 'row', marginBottom: 2 }}>
          <Text style={{ flex: 1, textAlign: 'left' }}>
            RESP. CONFERIU UTENSÍLIO: {pedido.responsavel_conferiu_utensilio}
          </Text>
        </View>
      </View>

      <Text style={{ ...styles.assinatura, fontWeight: 'bold', marginTop: 16 }}>
        CERTIFICO QUE EU CONFERI TODO MATERIAL E RESPONSABILIZO POR TODO E QUALQUER MATERIAL PRESCRITO NESTE CONTRATO.
      </Text>
      <Text style={styles.assinatura}>
        ASSINATURA: ____________________________   CPF/RG: ____________________________
      </Text>
    </Page>
  </Document>
);

export default PedidoPDF;
