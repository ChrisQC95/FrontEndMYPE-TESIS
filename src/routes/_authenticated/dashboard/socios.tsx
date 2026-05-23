import { createFileRoute } from '@tanstack/react-router'
import SociosPage from '@/features/socios/index'

export const Route = createFileRoute('/_authenticated/dashboard/socios')({
  component: SociosPage,
})
