import type { Serie, TipoComprobante } from './types';
import { auth } from "@/lib/firebase";

// ─── Base URLs ────────────────────────────────────────────────────────────────
// Antes: 
// const SERIES_URL = 'http://localhost:8080/api/series';
// const CATALOGOS_URL = 'http://localhost:8080/api/catalogos-sunat';

const SERIES_URL = `${import.meta.env.VITE_API_URL}/api/series`;
const CATALOGOS_URL = `${import.meta.env.VITE_API_URL}/api/catalogos-sunat`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getToken = async (): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No hay una sesión activa');
  return await currentUser.getIdToken();
};

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`Error HTTP ${res.status} — ${url}`);

  // Si es un DELETE, no esperamos JSON, solo retornamos void
  if (options.method === 'DELETE') return undefined as T;

  return res.json() as Promise<T>;
}

// ─── CRUD: Series ─────────────────────────────────────────────────────────────

/** Lista todas las series del usuario autenticado */
export const getSeries = (usuarioId: number): Promise<Serie[]> =>
  fetchWithAuth<Serie[]>(`${SERIES_URL}/usuario/${usuarioId}`, { method: 'GET' });

export const saveSerie = async (
  serie: Omit<Serie, 'id'> & { id?: number },
  usuarioId: number
): Promise<Serie> => {
  const payload = { ...serie, usuarioId };
  return fetchWithAuth<Serie>(SERIES_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

/** Elimina una serie por su ID */
export const deleteSerie = async (id: number): Promise<void> => {
  await fetchWithAuth<void>(`${SERIES_URL}/${id}`, { method: 'DELETE' });
};

// ─── Catálogo: Tipos de Comprobante ──────────────────────────────────────────

/** Carga el catálogo de tipos de comprobante desde SUNAT */
export const getTiposComprobante = (): Promise<TipoComprobante[]> =>
  fetchWithAuth<TipoComprobante[]>(`${CATALOGOS_URL}/tipos-comprobante`, { method: 'GET' });
