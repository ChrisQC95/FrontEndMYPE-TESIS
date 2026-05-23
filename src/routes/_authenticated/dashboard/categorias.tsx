import { createFileRoute } from '@tanstack/react-router'
import CategoriasPage from '@/features/categorias/index'

export const Route = createFileRoute('/_authenticated/dashboard/categorias')({
  component: CategoriasPage,
})