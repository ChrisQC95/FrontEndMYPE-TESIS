import type { Venta } from './types'
import { auth } from '@/lib/firebase'

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`

const getToken = async (): Promise<string> => {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('No hay una sesión activa')
  return await currentUser.getIdToken()
}

export const getHistorialVentas = async (usuarioId: number): Promise<Venta[]> => {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}/ventas/usuario/${usuarioId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  if (!res.ok) throw new Error('Error al cargar el historial de ventas')
  return res.json()
}
