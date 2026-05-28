import { auth } from "@/lib/firebase";
import type { CuentaBancaria } from './types';

const CUENTAS_URL = `${import.meta.env.VITE_API_URL}/api/cuentas-bancarias`;

const getToken = async (): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No hay una sesión activa');
  return await currentUser.getIdToken();
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`Error HTTP ${res.status} — ${url}`);

  if (options.method === 'DELETE') return undefined as T;

  return res.json() as Promise<T>;
}

/** Lista todas las cuentas bancarias del usuario autenticado */
export const getCuentas = async (usuarioId: number): Promise<CuentaBancaria[]> => {
  return fetchJson<CuentaBancaria[]>(`${CUENTAS_URL}/usuario/${usuarioId}`);
};

/** Crea o actualiza una cuenta bancaria */
export const saveCuenta = async (
  cuenta: Omit<CuentaBancaria, 'id'> & { id?: number },
  usuarioId: number
): Promise<CuentaBancaria> => {
  const payload = { ...cuenta, usuarioId };
  return fetchJson<CuentaBancaria>(CUENTAS_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/** Elimina una cuenta bancaria por su ID */
export const deleteCuenta = async (id: number): Promise<void> => {
  await fetchJson<void>(`${CUENTAS_URL}/${id}`, { method: 'DELETE' });
};
