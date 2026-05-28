import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  getProductos,
  getSociosNegocio,
  getSeries,
  getVehiculos,
  getConductores,
  registrarVenta,
} from './api'
import type {
  Producto,
  SocioNegocio,
  Serie,
  Vehiculo,
  Conductor,
  VentaRequestDTO,
  VentaDetalleRequestDTO,
  GuiaRemisionRequestDTO,
} from './types'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Trash2, Check, ChevronsUpDown, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function NuevaVenta() {
  const { dbUser } = useAuth()
  const usuarioId = dbUser?.id

  // ─── ESTADOS DE CATÁLOGOS ─────────────────────────────────────────────
  const [productos, setProductos] = useState<Producto[]>([])
  const [socios, setSocios] = useState<SocioNegocio[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [conductores, setConductores] = useState<Conductor[]>([])

  const [isLoading, setIsLoading] = useState(true)

  // ─── ESTADOS DE CABECERA (Sección A) ──────────────────────────────────
  const [clienteId, setClienteId] = useState<string>('')
  const [fechaEmision, setFechaEmision] = useState<string>(new Date().toISOString().split('T')[0])
  const [fechaVencimiento, setFechaVencimiento] = useState<string>(new Date().toISOString().split('T')[0])
  const [moneda, setMoneda] = useState<string>('1') // 1: Soles
  const [tipoPago, setTipoPago] = useState<string>('1') // 1: Contado
  const [tipoComprobante, setTipoComprobante] = useState<string>('1') // 1: Factura, 2: Boleta
  const [serieId, setSerieId] = useState<string>('')
  const [observacion, setObservacion] = useState<string>('')

  // ─── ESTADOS DE FILA DE ACCIÓN (Sección B) ────────────────────────────
  const [openProductSearch, setOpenProductSearch] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [inputCantidad, setInputCantidad] = useState<string>('1')
  const [inputPrecio, setInputPrecio] = useState<string>('0.00')

  // ─── ESTADO DE DETALLES (Sección C) ───────────────────────────────────
  const [detalles, setDetalles] = useState<VentaDetalleRequestDTO[]>([])

  // ─── ESTADOS DE GUÍA (Sección D) ──────────────────────────────────────
  const [generarGuia, setGenerarGuia] = useState(false)
  const [vehiculoId, setVehiculoId] = useState<string>('')
  const [conductorId, setConductorId] = useState<string>('')
  const [pesoBruto, setPesoBruto] = useState<string>('')
  const [motivoTraslado, setMotivoTraslado] = useState<string>('01')
  const [dirPartida, setDirPartida] = useState<string>('')
  const [ubiPartida, setUbiPartida] = useState<string>('')
  const [dirLlegada, setDirLlegada] = useState<string>('')
  const [ubiLlegada, setUbiLlegada] = useState<string>('')

  // ─── CARGA INICIAL ────────────────────────────────────────────────────
  useEffect(() => {
    if (!usuarioId) return

    const loadData = async () => {
      try {
        setIsLoading(true)
        const [prodRes, socRes, serRes, vehRes, condRes] = await Promise.all([
          getProductos(usuarioId),
          getSociosNegocio(usuarioId),
          getSeries(usuarioId),
          getVehiculos(usuarioId),
          getConductores(usuarioId),
        ])
        setProductos(prodRes || [])
        setSocios(socRes?.filter(s => s.tipoSocio === 'C' || s.tipoSocio === 'A') || [])
        setSeries(serRes?.filter(s => s.activo) || [])
        setVehiculos(vehRes || [])
        setConductores(condRes || [])
      } catch (error) {
        toast.error('Error al cargar datos iniciales')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [usuarioId])

  // ─── LÓGICA DE LA FILA DE ACCIÓN ──────────────────────────────────────
  const handleProductSelect = (prodId: number) => {
    const prod = productos.find(p => p.id === prodId)
    if (prod) {
      setSelectedProductId(prodId)
      setInputPrecio(prod.precioVenta.toFixed(2))
      setInputCantidad('1')
      setOpenProductSearch(false)
    }
  }

  const handleAgregarLinea = () => {
    if (!selectedProductId) {
      toast.warning('Seleccione un producto primero')
      return
    }
    const producto = productos.find(p => p.id === selectedProductId)
    if (!producto) return

    const cantidad = parseFloat(inputCantidad)
    const precioUnitario = parseFloat(inputPrecio)

    if (isNaN(cantidad) || cantidad <= 0) {
      toast.warning('Ingrese una cantidad válida')
      return
    }
    if (isNaN(precioUnitario) || precioUnitario < 0) {
      toast.warning('Ingrese un precio válido')
      return
    }

    if (producto.tipo === 'B' && cantidad > producto.stockActual) {
      toast.warning(`El stock disponible es ${producto.stockActual}`)
      return
    }

    // Cálculos SUNAT
    const valorUnitario = producto.afectoIgv ? precioUnitario / 1.18 : precioUnitario
    const igvLinea = producto.afectoIgv ? (precioUnitario - valorUnitario) * cantidad : 0
    const totalLinea = precioUnitario * cantidad

    const nuevaLinea: VentaDetalleRequestDTO = {
      productoId: producto.id,
      productoNombre: producto.nombre,
      unidadMedida: producto.unidadMedida,
      cantidad: Number(cantidad.toFixed(2)),
      precioUnitario: Number(precioUnitario.toFixed(2)),
      valorUnitario: Number(valorUnitario.toFixed(2)),
      igvLinea: Number(igvLinea.toFixed(2)),
      totalLinea: Number(totalLinea.toFixed(2)),
    }

    setDetalles(prev => {
      const existingIndex = prev.findIndex(item => item.productoId === producto.id)
      if (existingIndex >= 0) {
        const copy = [...prev]
        const curr = copy[existingIndex]

        const nuevaCantidad = curr.cantidad + nuevaLinea.cantidad
        if (producto.tipo === 'B' && nuevaCantidad > producto.stockActual) {
          toast.error(`Supera el stock. Max: ${producto.stockActual}`)
          return prev
        }

        const nuevoIgv = curr.igvLinea + nuevaLinea.igvLinea
        const nuevoTotal = curr.totalLinea + nuevaLinea.totalLinea

        copy[existingIndex] = {
          ...curr,
          cantidad: nuevaCantidad,
          igvLinea: Number(nuevoIgv.toFixed(2)),
          totalLinea: Number(nuevoTotal.toFixed(2))
        }
        return copy
      }
      return [...prev, nuevaLinea]
    })

    // Resetear fila
    setSelectedProductId(null)
    setInputCantidad('1')
    setInputPrecio('0.00')
  }

  const handleEliminarLinea = (index: number) => {
    setDetalles(prev => prev.filter((_, i) => i !== index))
  }

  // ─── CÁLCULOS TOTALES ─────────────────────────────────────────────────
  const { totalOpGravadas, totalOpInafectas, totalIgv, granTotal } = useMemo(() => {
    let gravadas = 0
    let inafectas = 0
    let igv = 0
    let total = 0

    detalles.forEach(item => {
      const prodOriginal = productos.find(p => p.id === item.productoId)
      if (prodOriginal?.afectoIgv) {
        gravadas += item.valorUnitario * item.cantidad
      } else {
        inafectas += item.totalLinea
      }
      igv += item.igvLinea
      total += item.totalLinea
    })

    return {
      totalOpGravadas: gravadas,
      totalOpInafectas: inafectas,
      totalIgv: igv,
      granTotal: total,
    }
  }, [detalles, productos])

  // ─── VALIDACIÓN Y ENVÍO ───────────────────────────────────────────────
  const seriesDisponibles = series.filter(s => s.tipoComprobanteId.toString() === tipoComprobante)

  // Auto-seleccionar serie si está vacía
  useEffect(() => {
    if (seriesDisponibles.length > 0 && !seriesDisponibles.find(s => s.id.toString() === serieId)) {
      setSerieId(seriesDisponibles[0].id.toString())
    }
  }, [seriesDisponibles, serieId])

  const clienteSeleccionado = socios.find(s => s.id.toString() === clienteId)
  const isFacturaValid = tipoComprobante === '1'
    ? clienteSeleccionado?.tipoDocumento === '06' && clienteSeleccionado?.numeroDocumento.length === 11
    : true

  const canSubmit = detalles.length > 0 && clienteId && serieId && isFacturaValid &&
    (!generarGuia || (vehiculoId && conductorId && pesoBruto && dirPartida && ubiPartida && dirLlegada && ubiLlegada))

  const handleGuardar = async () => {
    if (!usuarioId) return

    try {
      const serieObj = series.find(s => s.id.toString() === serieId)

      let guiaRemision: GuiaRemisionRequestDTO | null = null
      if (generarGuia) {
        guiaRemision = {
          vehiculoId: Number(vehiculoId),
          conductorId: Number(conductorId),
          pesoBrutoTotal: Number(pesoBruto),
          motivoTrasladoCodigo: motivoTraslado,
          direccionPartida: dirPartida,
          ubigeoPartida: ubiPartida,
          direccionLlegada: dirLlegada,
          ubigeoLlegada: ubiLlegada
        }
      }

      const payload: VentaRequestDTO = {
        usuarioId,
        socioNegocioId: Number(clienteId),
        tipoComprobanteId: Number(tipoComprobante),
        tipoOperacionId: 1, // Venta Interna
        monedaId: Number(moneda),
        tipoPagoId: Number(tipoPago),
        serie: serieObj?.serie || '',
        fechaEmision: fechaEmision,
        fechaVencimiento: fechaVencimiento,
        opGravadas: Number(totalOpGravadas.toFixed(2)),
        opExoneradas: 0,
        opInafectas: Number(totalOpInafectas.toFixed(2)),
        igv: Number(totalIgv.toFixed(2)),
        total: Number(granTotal.toFixed(2)),
        detalles,
        guiaRemision
      }

      await registrarVenta(payload)
      toast.success('Venta registrada exitosamente', {
        description: '⚠️ AVISO: Esta venta es solo de prueba y no tiene validez legal.',
        duration: 6000,
      })

      // Limpiar formulario
      setDetalles([])
      setClienteId('')
      setSerieId('')
      setGenerarGuia(false)
      setObservacion('')
      setSelectedProductId(null)

    } catch (error: any) {
      toast.error(error.message || 'Error al guardar la venta')
    }
  }

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Cargando formulario...</div>

  return (
    <div className="w-full bg-slate-100 min-h-screen overflow-y-auto pb-20">

      {/* TÍTULO SUPERIOR */}
      <div className="bg-white shadow-sm border-b px-6 py-4 mb-6">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Registro de Venta</h1>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-8">

        {/* TARJETA 1: CABECERA DEL COMPROBANTE */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-semibold text-slate-700">Datos del Comprobante</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

              {/* Cliente */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-600">Cliente</Label>
                <Select value={clienteId} onValueChange={setClienteId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="-- Seleccione su Cliente --" />
                  </SelectTrigger>
                  <SelectContent>
                    {socios.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.numeroDocumento} - {s.nombreRazonSocial}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {tipoComprobante === '1' && clienteSeleccionado && clienteSeleccionado.numeroDocumento.length !== 11 && (
                  <p className="text-[10px] text-destructive">La factura exige RUC (11 dígitos).</p>
                )}
              </div>

              {/* Fecha Operación */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Fecha Emisión</Label>
                <Input type="date" className="h-9" value={fechaEmision} onChange={e => setFechaEmision(e.target.value)} />
              </div>

              {/* Fecha Vencimiento */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Fecha Vencimiento</Label>
                <Input type="date" className="h-9" value={fechaVencimiento} onChange={e => setFechaVencimiento(e.target.value)} />
              </div>

              {/* Tipo Comprobante */}
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-600">Comprobante</Label>
                <Select value={tipoComprobante} onValueChange={(val) => {
                  setTipoComprobante(val)
                  setSerieId('')
                }}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">01 - FACTURA ELECTRONICA</SelectItem>
                    <SelectItem value="2">03 - BOLETA DE VENTA ELECTRONICA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Serie */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Serie</Label>
                <Select value={serieId} onValueChange={setSerieId}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Seleccione Serie" /></SelectTrigger>
                  <SelectContent>
                    {seriesDisponibles.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.serie} (Sig: {s.correlativoActual + 1})
                      </SelectItem>
                    ))}
                    {seriesDisponibles.length === 0 && (
                      <SelectItem value="none" disabled>No hay series activas</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Moneda */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Moneda</Label>
                <Select value={moneda} onValueChange={setMoneda}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">SOLES</SelectItem>
                    <SelectItem value="2">DÓLARES</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tipo Pago */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Tipo Pago</Label>
                <Select value={tipoPago} onValueChange={setTipoPago}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">CONTADO</SelectItem>
                    <SelectItem value="2">CRÉDITO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Observacion */}
              <div className="space-y-1.5 md:col-span-3">
                <Label className="text-xs font-semibold text-slate-600">Observación</Label>
                <Input className="h-9" value={observacion} onChange={e => setObservacion(e.target.value)} />
              </div>

            </div>
          </CardContent>
        </Card>

        {/* TARJETA 2: DETALLE DE VENTA */}
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b pb-3 pt-4">
            <CardTitle className="text-sm font-semibold text-slate-700">Detalles de Venta</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {/* Fila Buscador */}
            <div className="bg-slate-50 p-4 border-b flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Producto / Servicio</Label>
                <Popover open={openProductSearch} onOpenChange={setOpenProductSearch}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={openProductSearch} className="w-full justify-between bg-white h-9 border-slate-300">
                      <span className="truncate">
                        {selectedProductId
                          ? productos.find((p) => p.id === selectedProductId)?.nombre
                          : "-- Buscar producto --"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar por nombre o código..." />
                      <CommandList>
                        <CommandEmpty>No se encontró el producto.</CommandEmpty>
                        <CommandGroup>
                          {productos.map((prod) => (
                            <CommandItem
                              key={prod.id}
                              value={`${prod.codigo} ${prod.nombre}`}
                              onSelect={() => handleProductSelect(prod.id)}
                            >
                              <Check className={cn("mr-2 h-4 w-4", selectedProductId === prod.id ? "opacity-100" : "opacity-0")} />
                              <div className="flex flex-col">
                                <span>{prod.nombre}</span>
                                <span className="text-[10px] text-muted-foreground">Cód: {prod.codigo} | Stock: {prod.stockActual}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="w-28 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">Cantidad</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="1"
                  className="h-9 bg-white border-slate-300"
                  value={inputCantidad}
                  onChange={e => setInputCantidad(e.target.value)}
                />
              </div>

              <div className="w-32 space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600">V. Unitario</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-9 bg-white border-slate-300"
                  value={inputPrecio}
                  onChange={e => setInputPrecio(e.target.value)}
                />
              </div>

              <Button
                onClick={handleAgregarLinea}
                className="h-9 bg-[#f59e0b] hover:bg-[#d97706] text-white font-bold px-6 shadow-none"
              >
                AGREGAR
              </Button>
            </div>

            {/* Tabla Detalles */}
            <div className="w-full">
              <Table>
                <TableHeader className="bg-slate-800 hover:bg-slate-800">
                  <TableRow>
                    <TableHead className="w-12 text-slate-200 text-xs text-center h-10">N°</TableHead>
                    <TableHead className="text-slate-200 text-xs h-10">Producto / Servicio</TableHead>
                    <TableHead className="text-slate-200 text-xs text-center h-10">Afecto</TableHead>
                    <TableHead className="text-slate-200 text-xs text-right h-10">Cantidad</TableHead>
                    <TableHead className="text-slate-200 text-xs text-right h-10">V. Unitario</TableHead>
                    <TableHead className="text-slate-200 text-xs text-right h-10">Total</TableHead>
                    <TableHead className="w-16 text-slate-200 text-xs text-center h-10">Opc.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground bg-white">
                        No hay items agregados en el documento.
                      </TableCell>
                    </TableRow>
                  ) : (
                    detalles.map((item, idx) => {
                      const esAfecto = productos.find(p => p.id === item.productoId)?.afectoIgv
                      return (
                        <TableRow key={idx} className="border-b last:border-0 bg-white hover:bg-slate-50">
                          <TableCell className="text-center text-xs font-medium">{idx + 1}</TableCell>
                          <TableCell className="text-sm">{item.productoNombre}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={esAfecto ? 'default' : 'secondary'} className="text-[10px] uppercase font-normal">
                              {esAfecto ? 'SÍ' : 'NO'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm">{item.cantidad}</TableCell>
                          <TableCell className="text-right text-sm">{item.precioUnitario.toFixed(2)}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{item.totalLinea.toFixed(2)}</TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleEliminarLinea(idx)}>
                              <Trash2 size={14} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* TARJETA 3: GUÍA DE REMISIÓN */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b pb-3 pt-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-700">Guía de Remisión Remitente</CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="guia-switch" className="text-xs font-medium text-slate-600 cursor-pointer">Generar Guía</Label>
              <Switch id="guia-switch" checked={generarGuia} onCheckedChange={setGenerarGuia} />
            </div>
          </CardHeader>

          {generarGuia && (
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Vehículo</Label>
                  <Select value={vehiculoId} onValueChange={setVehiculoId}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccione Placa" /></SelectTrigger>
                    <SelectContent>
                      {vehiculos.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.placa} ({v.marca})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Conductor</Label>
                  <Select value={conductorId} onValueChange={setConductorId}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Seleccione Conductor" /></SelectTrigger>
                    <SelectContent>
                      {conductores.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombreCompleto}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Peso Bruto (KGM)</Label>
                  <Input type="number" step="0.01" className="h-9" value={pesoBruto} onChange={e => setPesoBruto(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600">Motivo Traslado</Label>
                  <Select value={motivoTraslado} onValueChange={setMotivoTraslado}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="01">01 - Venta</SelectItem>
                      <SelectItem value="14">14 - Venta sujeta a confirmación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
                  <Label className="text-xs font-semibold text-slate-600">Punto de Partida (Ubigeo - Dirección)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Ubigeo" className="h-9 w-24" value={ubiPartida} onChange={e => setUbiPartida(e.target.value)} />
                    <Input placeholder="Dirección completa" className="h-9 flex-1" value={dirPartida} onChange={e => setDirPartida(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2 lg:col-span-2">
                  <Label className="text-xs font-semibold text-slate-600">Punto de Llegada (Ubigeo - Dirección)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Ubigeo" className="h-9 w-24" value={ubiLlegada} onChange={e => setUbiLlegada(e.target.value)} />
                    <Input placeholder="Dirección completa" className="h-9 flex-1" value={dirLlegada} onChange={e => setDirLlegada(e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* TARJETA 4: TOTALES Y GUARDAR */}
        <div className="flex justify-end">
          <div className="w-full md:w-80 space-y-4">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="p-0 divide-y divide-slate-100">
                <div className="flex justify-between items-center px-4 py-3 bg-white">
                  <span className="text-sm font-semibold text-slate-500">Op. Inafectas / Exon.</span>
                  <span className="text-sm font-mono text-slate-700">S/ {totalOpInafectas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-white">
                  <span className="text-sm font-semibold text-slate-500">Op. Gravadas</span>
                  <span className="text-sm font-mono text-slate-700">S/ {totalOpGravadas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-3 bg-white">
                  <span className="text-sm font-semibold text-slate-500">IGV (18.00 %)</span>
                  <span className="text-sm font-mono text-slate-700">S/ {totalIgv.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center px-4 py-4 bg-slate-50 rounded-b-lg">
                  <span className="text-sm font-bold text-slate-800 uppercase">Importe Total</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">S/ {granTotal.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              className="w-full h-12 bg-[#82c91e] hover:bg-[#6eb017] text-white font-bold text-base shadow-sm"
              disabled={!canSubmit}
              onClick={handleGuardar}
            >
              <Save className="mr-2 h-5 w-5" /> GUARDAR VENTA
            </Button>
          </div>
        </div>

      </div>
    </div>
  )
}
