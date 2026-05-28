import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import type { Venta } from '../types'
import { format } from 'date-fns'

// Mapeos estáticos (similares a index.tsx)
const TIPOS_COMPROBANTE: Record<number, string> = {
  1: 'FACTURA ELECTRÓNICA',
  2: 'BOLETA DE VENTA ELECTRÓNICA',
}

const MONEDAS: Record<number, string> = {
  1: 'PEN - Soles',
  2: 'USD - Dólares',
}

const TIPOS_PAGO: Record<number, string> = {
  1: 'Contado',
  2: 'Crédito a 30 días',
}

// Estilos
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#334155',
  },
  // --- Header ---
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    width: '60%',
    paddingRight: 10,
  },
  logoPlaceholder: {
    width: 120,
    height: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  empresaNombre: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  empresaInfo: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  headerRight: {
    width: '40%',
  },
  rucBox: {
    borderWidth: 1.5,
    borderColor: '#0f172a',
    borderRadius: 6,
    padding: 10,
    alignItems: 'center',
  },
  rucText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  tipoComprobanteText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#0f172a',
  },
  serieCorrelativoText: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  // --- Datos del Cliente ---
  clientBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },
  clientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  clientCol: {
    width: '50%',
    marginBottom: 6,
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  // --- Guia Remision ---
  guiaBox: {
    flexDirection: 'row',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  guiaText: {
    fontSize: 9,
    color: '#475569',
  },
  // --- Tabla de Detalles ---
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#334155',
    paddingVertical: 6,
    paddingHorizontal: 4,
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRowZebra: {
    backgroundColor: '#f8fafc',
  },
  colCant: { width: '10%', textAlign: 'center' },
  colUnd: { width: '10%', textAlign: 'center' },
  colDesc: { width: '45%' },
  colPU: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  // --- Footer y Totales ---
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  footerLeft: {
    width: '60%',
    paddingRight: 20,
  },
  montoLetras: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 15,
  },
  cuentasBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 8,
  },
  cuentasTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
    color: '#64748b',
  },
  cuentaLine: {
    fontSize: 8,
    marginBottom: 2,
  },
  footerRight: {
    width: '35%',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  totalValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  granTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: '#334155',
  },
  granTotalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  granTotalValue: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textAlign: 'right',
  },
  // --- Nota Final ---
  notaFinal: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
  },
})

interface FacturaPDFProps {
  venta: Venta
  clienteNombre: string
  clienteDocumento: string
}

export const FacturaPDF = ({ venta, clienteNombre, clienteDocumento }: FacturaPDFProps) => {
  const tipoComprobanteStr = TIPOS_COMPROBANTE[venta.tipoComprobanteId] || 'COMPROBANTE ELECTRÓNICO'
  const monedaStr = MONEDAS[venta.monedaId] || 'Soles'
  const condicionPagoStr = TIPOS_PAGO[venta.tipoPagoId] || 'Contado'

  const fechaEmision = format(new Date(venta.fechaEmision), 'dd/MM/yyyy')
  const fechaVencimiento = venta.fechaVencimiento ? format(new Date(venta.fechaVencimiento), 'dd/MM/yyyy') : '-'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* CABECERA */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>LOGO EMPRESA</Text>
            </View>
            <Text style={styles.empresaNombre}>MI EMPRESA S.A.C.</Text>
            <Text style={styles.empresaInfo}>Av. Principal 123, Distrito Comercial, Lima</Text>
            <Text style={styles.empresaInfo}>Teléfono: (01) 555-1234</Text>
            <Text style={styles.empresaInfo}>Email: facturacion@miempresa.com.pe</Text>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.rucBox}>
              <Text style={styles.rucText}>RUC: 20123456789</Text>
              <Text style={styles.tipoComprobanteText}>{tipoComprobanteStr}</Text>
              <Text style={styles.serieCorrelativoText}>
                {venta.serie}-{venta.correlativo.toString().padStart(6, '0')}
              </Text>
            </View>
          </View>
        </View>

        {/* DATOS DEL CLIENTE */}
        <View style={styles.clientBox}>
          <View style={styles.clientGrid}>
            <View style={styles.clientCol}>
              <Text style={styles.label}>Cliente (Razón Social)</Text>
              <Text style={styles.value}>{clienteNombre}</Text>
            </View>
            <View style={styles.clientCol}>
              <Text style={styles.label}>RUC / DNI</Text>
              <Text style={styles.value}>{clienteDocumento}</Text>
            </View>
            <View style={styles.clientCol}>
              <Text style={styles.label}>Dirección</Text>
              <Text style={styles.value}>Lima, Perú (Dirección de prueba)</Text>
            </View>
            <View style={styles.clientCol}>
              <Text style={styles.label}>Moneda</Text>
              <Text style={styles.value}>{monedaStr}</Text>
            </View>
            <View style={styles.clientCol}>
              <Text style={styles.label}>Fecha de Emisión</Text>
              <Text style={styles.value}>{fechaEmision}</Text>
            </View>
            <View style={styles.clientCol}>
              <Text style={styles.label}>Fecha de Venc. / Condición</Text>
              <Text style={styles.value}>{fechaVencimiento} / {condicionPagoStr}</Text>
            </View>
          </View>
        </View>

        {/* GUÍA DE REMISIÓN (Opcional) */}
        {venta.guiaRemision && (
          <View style={styles.guiaBox}>
            <Text style={styles.guiaText}>
              <Text style={{ fontFamily: 'Helvetica-Bold' }}>Guía de Remisión: </Text>
              {venta.guiaRemision.motivoTrasladoCodigo} - Placa: Vehículo {venta.guiaRemision.vehiculoId} - Conductor: ID {venta.guiaRemision.conductorId}
            </Text>
          </View>
        )}

        {/* TABLA DE DETALLES */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colCant}>CANT.</Text>
            <Text style={styles.colUnd}>UND.</Text>
            <Text style={styles.colDesc}>DESCRIPCIÓN</Text>
            <Text style={styles.colPU}>P. UNITARIO</Text>
            <Text style={styles.colTotal}>TOTAL</Text>
          </View>
          
          {venta.detalles.map((d, i) => (
            <View key={d.id} style={[styles.tableRow, i % 2 !== 0 ? styles.tableRowZebra : {}]}>
              <Text style={styles.colCant}>{d.cantidad}</Text>
              <Text style={styles.colUnd}>{d.unidadMedida}</Text>
              <Text style={styles.colDesc}>{d.productoNombre}</Text>
              <Text style={styles.colPU}>{d.precioUnitario.toFixed(2)}</Text>
              <Text style={styles.colTotal}>{d.totalLinea.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* FOOTER Y TOTALES */}
        <View style={styles.footerContainer}>
          <View style={styles.footerLeft}>
            <Text style={styles.montoLetras}>SON: {venta.total.toFixed(2)} CON 00/100 {monedaStr.toUpperCase()}</Text>
            
            <View style={styles.cuentasBox}>
              <Text style={styles.cuentasTitle}>CUENTAS BANCARIAS</Text>
              <Text style={styles.cuentaLine}>BCP Soles: 191-1234567-0-00 (CCI: 0021911234567000)</Text>
              <Text style={styles.cuentaLine}>BBVA Soles: 0011-0123-456789 (CCI: 01101234567890)</Text>
              <Text style={styles.cuentaLine}>Yape / Plin: 999 888 777</Text>
            </View>
          </View>

          <View style={styles.footerRight}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Op. Inafecta</Text>
              <Text style={styles.totalValue}>{venta.opInafectas.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Op. Gratuita</Text>
              <Text style={styles.totalValue}>0.00</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Op. Gravada</Text>
              <Text style={styles.totalValue}>{venta.opGravadas.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Descuentos</Text>
              <Text style={styles.totalValue}>0.00</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IGV (18%)</Text>
              <Text style={styles.totalValue}>{venta.igv.toFixed(2)}</Text>
            </View>
            <View style={styles.granTotalRow}>
              <Text style={styles.granTotalLabel}>IMPORTE TOTAL</Text>
              <Text style={styles.granTotalValue}>{venta.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* NOTA FINAL */}
        <Text style={styles.notaFinal}>
          sistema de prueba Konecta.erp, para el sistema completo contactar a +51 991 060 595
        </Text>
      </Page>
    </Document>
  )
}
