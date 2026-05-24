import type { Serie, TipoComprobante } from './types';

// ─── Base URLs ────────────────────────────────────────────────────────────────
// Antes: 
// const SERIES_URL = 'http://localhost:8080/api/series';
// const CATALOGOS_URL = 'http://localhost:8080/api/catalogos-sunat';

const SERIES_URL = `${import.meta.env.VITE_API_URL}/api/series`;
const CATALOGOS_URL = `${import.meta.env.VITE_API_URL}/api/catalogos-sunat`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error HTTP ${res.status} — ${url}`);
  return res.json() as Promise<T>;
}

// ─── CRUD: Series ─────────────────────────────────────────────────────────────

/** Lista todas las series del usuario autenticado */
export const getSeries = (usuarioId: number): Promise<Serie[]> =>
  fetchJson<Serie[]>(`${SERIES_URL}/usuario/${usuarioId}`);

/**
 * Crea o actualiza una serie.
 * Siempre inyecta el `usuarioId` para evitar spoofing.
 */
export const saveSerie = async (
  serie: Omit<Serie, 'id'> & { id?: number },
  usuarioId: number
): Promise<Serie> => {
  const payload: Omit<Serie, 'id'> & { id?: number } = { ...serie, usuarioId };
  const res = await fetch(SERIES_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error HTTP ${res.status} — guardar serie`);
  return res.json() as Promise<Serie>;
};

/** Elimina una serie por su ID */
export const deleteSerie = async (id: number): Promise<void> => {
  const res = await fetch(`${SERIES_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Error HTTP ${res.status} — eliminar serie`);
};

// ─── Catálogo: Tipos de Comprobante ──────────────────────────────────────────

/** Carga el catálogo de tipos de comprobante desde SUNAT */
export const getTiposComprobante = (): Promise<TipoComprobante[]> =>
  fetchJson<TipoComprobante[]>(`${CATALOGOS_URL}/tipos-comprobante`);
