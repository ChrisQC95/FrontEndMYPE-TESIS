import { useEffect, useState } from 'react'
import { getHistorialVentas } from './api'
import { getSociosNegocio } from '../nueva-venta/api'
import type { Venta } from './types'
import type { SocioNegocio } from '../nueva-venta/types'
import { useAuth } from '@/context/AuthContext'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { Eye, FileText, FileDown, Building2, Wallet } from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FacturaPDF } from './components/FacturaPDF'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

// --- Utilidades de Mapeo Estático ---
const TIPOS_COMPROBANTE: Record<number, string> = {
  1: 'FACTURA ELECTRÓNICA',
  2: 'BOLETA DE VENTA',
}

const MONEDAS: Record<number, string> = {
  1: 'PEN - Soles',
  2: 'USD - Dólares',
}

const TIPOS_PAGO: Record<number, string> = {
  1: 'Contado',
  2: 'Crédito a 30 días',
}

const getBadgeColor = (estado: string | null) => {
  switch (estado) {
    case 'ACEPTADO':
      return 'bg-green-100 text-green-800 border-green-300'
    case 'PENDIENTE':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'RECHAZADO':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'ANULADO':
      return 'bg-gray-100 text-gray-800 border-gray-300'
    default:
      // Si el backend aún no envía estado, lo mostramos gris/amarillo como "PENDIENTE"
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  }
}

export function HistorialVentas() {
  const { dbUser } = useAuth()
  const currentUserId = dbUser?.id

  const [ventas, setVentas] = useState<Venta[]>([])
  const [socios, setSocios] = useState<SocioNegocio[]>([])
  const [loading, setLoading] = useState(true)

  const [ventaActiva, setVentaActiva] = useState<Venta | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Carga inicial
  useEffect(() => {
    if (!currentUserId) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [ventasData, sociosData] = await Promise.all([
          getHistorialVentas(currentUserId),
          getSociosNegocio(currentUserId),
        ])
        // Ordenamos ventas de más reciente a más antigua
        const sortedVentas = ventasData.sort((a, b) => b.id - a.id)
        setVentas(sortedVentas)
        setSocios(sociosData)
      } catch (error) {
        console.error(error)
        toast.error('Error al cargar el historial de ventas')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentUserId])

  // Helpers
  const getSocioNombre = (id: number) => {
    const socio = socios.find(s => s.id === id)
    return socio ? socio.nombreRazonSocial : `ID: ${id}`
  }

  const getSocioDocumento = (id: number) => {
    const socio = socios.find(s => s.id === id)
    return socio ? socio.numeroDocumento : ''
  }

  const handleVerDetalle = (venta: Venta) => {
    setVentaActiva(venta)
    setModalOpen(true)
  }

  const handleDescargarPDF = () => {
    toast.info('Generación de PDF en construcción', { icon: '🚧' })
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 md:p-8">
      {/* Cabecera */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Historial de Ventas</h1>
        <p className="text-slate-500 mt-1">Consulta los comprobantes emitidos y su estado en SUNAT.</p>
      </div>

      {/* Tabla Principal */}
      <Card className="border shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[120px]">Fecha</TableHead>
              <TableHead>Comprobante</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  Cargando historial...
                </TableCell>
              </TableRow>
            ) : ventas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  No se encontraron ventas registradas.
                </TableCell>
              </TableRow>
            ) : (
              ventas.map((venta) => (
                <TableRow key={venta.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-700">
                    {format(new Date(venta.fechaEmision), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-semibold tracking-wider">
                        {TIPOS_COMPROBANTE[venta.tipoComprobanteId] || 'COMPROBANTE'}
                      </span>
                      <span className="font-mono text-slate-900">{venta.serie}-{venta.correlativo.toString().padStart(6, '0')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-medium truncate max-w-[250px]" title={getSocioNombre(venta.socioNegocioId)}>
                        {getSocioNombre(venta.socioNegocioId)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {getSocioDocumento(venta.socioNegocioId)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">
                    S/ {venta.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={`font-semibold ${getBadgeColor(venta.estadoSunat)}`}>
                      {venta.estadoSunat || 'PENDIENTE'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleVerDetalle(venta)} className="text-slate-500 hover:text-indigo-600">
                      <Eye className="w-5 h-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Maestro-Detalle */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-50/50">
          {ventaActiva && (
            <div className="flex flex-col h-[85vh] md:h-auto">
              {/* Header */}
              <div className="bg-white px-6 py-5 border-b flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {TIPOS_COMPROBANTE[ventaActiva.tipoComprobanteId] || 'COMPROBANTE'} {ventaActiva.serie}-{ventaActiva.correlativo.toString().padStart(6, '0')}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Emitido el {format(new Date(ventaActiva.fechaEmision), "EEEE, d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                  </p>
                </div>
                <Badge variant="outline" className={`px-3 py-1 text-xs font-bold uppercase tracking-widest ${getBadgeColor(ventaActiva.estadoSunat)}`}>
                  {ventaActiva.estadoSunat || 'PENDIENTE'}
                </Badge>
              </div>

              {/* Contenido (Cards + Tabla) */}
              <ScrollArea className="flex-1 px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Card Cliente */}
                  <Card className="shadow-none border-slate-200">
                    <CardContent className="p-4 flex gap-4">
                      <div className="bg-slate-100 p-3 rounded-lg h-fit text-slate-500">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Cliente</span>
                        <span className="font-semibold text-slate-900">{getSocioNombre(ventaActiva.socioNegocioId)}</span>
                        <span className="text-sm text-slate-600 mt-0.5">RUC/DNI: {getSocioDocumento(ventaActiva.socioNegocioId)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card Resumen Financiero */}
                  <Card className="shadow-none border-slate-200">
                    <CardContent className="p-4 flex gap-4">
                      <div className="bg-slate-100 p-3 rounded-lg h-fit text-slate-500">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col w-full">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Condiciones</span>
                        <div className="grid grid-cols-2 gap-2 mt-0.5">
                          <div>
                            <p className="text-xs text-slate-400">Moneda</p>
                            <p className="text-sm font-medium text-slate-900">{MONEDAS[ventaActiva.monedaId] || 'Soles'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400">Pago</p>
                            <p className="text-sm font-medium text-slate-900">{TIPOS_PAGO[ventaActiva.tipoPagoId] || 'Contado'}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabla de Detalles */}
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[80px]">Cant.</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="w-[100px]">U.M.</TableHead>
                        <TableHead className="text-right w-[120px]">Precio Unit.</TableHead>
                        <TableHead className="text-right w-[120px]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ventaActiva.detalles.map((d) => (
                        <TableRow key={d.id}>
                          <TableCell className="font-medium">{d.cantidad}</TableCell>
                          <TableCell className="text-slate-700">{d.productoNombre}</TableCell>
                          <TableCell className="text-slate-500">{d.unidadMedida}</TableCell>
                          <TableCell className="text-right text-slate-600">{d.precioUnitario.toFixed(2)}</TableCell>
                          <TableCell className="text-right font-medium text-slate-900">{d.totalLinea.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="bg-white border-t px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <PDFDownloadLink
                  document={
                    <FacturaPDF
                      venta={ventaActiva}
                      clienteNombre={getSocioNombre(ventaActiva.socioNegocioId)}
                      clienteDocumento={getSocioDocumento(ventaActiva.socioNegocioId)}
                    />
                  }
                  fileName={`documento_${ventaActiva.serie}-${ventaActiva.correlativo.toString().padStart(6, '0')}.pdf`}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-red-200 bg-transparent h-10 px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700 w-full sm:w-auto"
                >
                  {({ loading }) => (
                    <>
                      <FileDown className="w-4 h-4 mr-2" />
                      {loading ? 'Generando PDF...' : 'Descargar PDF'}
                    </>
                  )}
                </PDFDownloadLink>

                <div className="flex gap-6 text-right ml-auto">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Op. Gravadas</span>
                    <span className="font-medium text-slate-700">S/ {ventaActiva.opGravadas.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">IGV (18%)</span>
                    <span className="font-medium text-slate-700">S/ {ventaActiva.igv.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col border-l pl-6">
                    <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Total</span>
                    <span className="text-xl font-bold text-slate-900">S/ {ventaActiva.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
