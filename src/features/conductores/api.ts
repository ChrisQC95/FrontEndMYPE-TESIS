import type { Conductor } from './types';

// Antes: const BASE_URL = 'http://localhost:8080/api/conductores';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/conductores`;

export const getConductores = async (usuarioId: number): Promise<Conductor[]> => {
  const res = await fetch(`${BASE_URL}/usuario/${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar los conductores');
  return res.json();
};

export const saveConductor = async (
  conductor: Omit<Conductor, 'id'> & { id?: number },
  usuarioId: number
): Promise<Conductor> => {
  const payload: Conductor = { ...conductor, usuarioId };
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al guardar el conductor');
  return res.json();
};

export const deleteConductor = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar el conductor');
};
