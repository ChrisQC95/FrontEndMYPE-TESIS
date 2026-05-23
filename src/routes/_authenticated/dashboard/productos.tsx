import { createFileRoute } from '@tanstack/react-router'
import ProductosPage from '@/features/productos/index'

export const Route = createFileRoute('/_authenticated/dashboard/productos')({
  component: ProductosPage,
})
