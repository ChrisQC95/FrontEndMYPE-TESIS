import { createFileRoute } from '@tanstack/react-router'
import { HistorialVentas } from '@/features/ventas/historial'

export const Route = createFileRoute('/_authenticated/dashboard/ventas/historial')({
  component: HistorialVentas,
})
