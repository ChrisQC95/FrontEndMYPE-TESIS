import { createFileRoute } from '@tanstack/react-router'
import ConductoresPage from '@/features/conductores/index'

export const Route = createFileRoute('/_authenticated/dashboard/conductores')({
  component: ConductoresPage,
})
