import type { Vehiculo } from './types';
import { auth } from "@/lib/firebase";

// Antes: const BASE_URL = 'http://localhost:8080/api/vehiculos';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/vehiculos`;

const getToken = async (): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No hay una sesión activa');
  return await currentUser.getIdToken();
};

export const getVehiculos = async (usuarioId: number): Promise<Vehiculo[]> => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/usuario/${usuarioId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al cargar los vehículos');
  return res.json();
};

export const saveVehiculo = async (
  vehiculo: Omit<Vehiculo, 'id'> & { id?: number },
  usuarioId: number
): Promise<Vehiculo> => {
  const token = await getToken();
  const payload: Vehiculo = { ...vehiculo, usuarioId };
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al guardar el vehículo');
  return res.json();
};

export const deleteVehiculo = async (id: number): Promise<void> => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al eliminar el vehículo');
};
