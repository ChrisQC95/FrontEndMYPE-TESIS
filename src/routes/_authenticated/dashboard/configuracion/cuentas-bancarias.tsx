import { createFileRoute } from '@tanstack/react-router'
import CuentasBancariasPage from '@/features/configuracion/cuentas-bancarias'

export const Route = createFileRoute(
  '/_authenticated/dashboard/configuracion/cuentas-bancarias',
)({
  component: () => <CuentasBancariasPage />,
})
