import { createFileRoute } from '@tanstack/react-router'
import NuevaVenta from '@/features/ventas/nueva-venta'

export const Route = createFileRoute('/_authenticated/dashboard/ventas/nueva')({
  component: NuevaVentaComponent,
})

function NuevaVentaComponent() {
  return <NuevaVenta />
}
