import type { Conductor } from './types';
import { auth } from "@/lib/firebase";

// Antes: const BASE_URL = 'http://localhost:8080/api/conductores';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/conductores`;

const getToken = async (): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No hay una sesión activa');
  return await currentUser.getIdToken();
};

export const getConductores = async (usuarioId: number): Promise<Conductor[]> => {
  const token = await getToken(); // 1. Pedimos el pase

  const res = await fetch(`${BASE_URL}/usuario/${usuarioId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}` // 2. Lo enviamos
    }
  });

  if (!res.ok) throw new Error('Error al cargar los conductores');
  return res.json();
};

export const saveConductor = async (
  conductor: Omit<Conductor, 'id'> & { id?: number },
  usuarioId: number
): Promise<Conductor> => {
  const token = await getToken();
  const payload: Conductor = { ...conductor, usuarioId };

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Combinamos Content-Type con el token
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Error al guardar el conductor');
  return res.json();
};

export const deleteConductor = async (id: number): Promise<void> => {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}` // El DELETE también necesita el pase
    }
  });

  if (!res.ok) throw new Error('Error al eliminar el conductor');
};
