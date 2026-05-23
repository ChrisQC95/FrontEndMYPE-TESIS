import { createFileRoute } from '@tanstack/react-router'
import VehiculosPage from '@/features/vehiculos/index'

export const Route = createFileRoute('/_authenticated/dashboard/vehiculos')({
  component: VehiculosPage,
})
