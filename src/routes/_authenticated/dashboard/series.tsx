import { createFileRoute } from '@tanstack/react-router'
import SeriesPage from '@/features/series/index'

export const Route = createFileRoute('/_authenticated/dashboard/series')({
  component: SeriesPage,
})
