import type { Vehiculo } from './types';

// Antes: const BASE_URL = 'http://localhost:8080/api/vehiculos';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api/vehiculos`;

export const getVehiculos = async (usuarioId: number): Promise<Vehiculo[]> => {
  const res = await fetch(`${BASE_URL}/usuario/${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar los vehículos');
  return res.json();
};

export const saveVehiculo = async (
  vehiculo: Omit<Vehiculo, 'id'> & { id?: number },
  usuarioId: number
): Promise<Vehiculo> => {
  const payload: Vehiculo = { ...vehiculo, usuarioId };
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al guardar el vehículo');
  return res.json();
};

export const deleteVehiculo = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar el vehículo');
};
