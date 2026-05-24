import type { SocioNegocio, Ubigeo } from './types';

// ─── Base URLs ────────────────────────────────────────────────────────────────
// Antes:
// const SOCIOS_URL = 'http://localhost:8080/api/socios';
// const UBIGEOS_URL = 'http://localhost:8080/api/catalogos-sunat';

const SOCIOS_URL = `${import.meta.env.VITE_API_URL}/api/socios`;
const UBIGEOS_URL = `${import.meta.env.VITE_API_URL}/api/catalogos-sunat`;

// ─── Tipos internos del backend ───────────────────────────────────────────────

/**
 * El backend devuelve `ubigeo` como objeto anidado (relación @ManyToOne).
 * Este tipo representa el JSON real que llega del endpoint.
 */
interface SocioNegocioRaw extends Omit<SocioNegocio, 'ubigeo'> {
  ubigeo: Ubigeo | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error HTTP ${res.status} — ${url}`);
  return res.json() as Promise<T>;
}

/**
 * Normaliza un socio recibido del backend:
 * aplana el objeto `ubigeo` anidado → extrae solo el código de 6 dígitos.
 */
function normalizeSocio(raw: SocioNegocioRaw): SocioNegocio {
  return {
    ...raw,
    ubigeo: raw.ubigeo?.ubigeo ?? null,
  };
}

// ─── CRUD: Socios de Negocio ──────────────────────────────────────────────────

/** Lista todos los socios del usuario autenticado */
export const getSocios = async (usuarioId: number): Promise<SocioNegocio[]> => {
  const raw = await fetchJson<SocioNegocioRaw[]>(`${SOCIOS_URL}/usuario/${usuarioId}`);
  return raw.map(normalizeSocio);
};

/**
 * Crea o actualiza un socio de negocio.
 * Envía el DTO plano que el backend espera: solo el código ubigeo (string).
 * Siempre inyecta el `usuarioId` actual para evitar spoofing.
 */
export const saveSocio = async (
  socio: Omit<SocioNegocio, 'id'> & { id?: number },
  usuarioId: number
): Promise<SocioNegocio> => {
  // El backend recibe SocioNegocioDTO con ubigeo como string
  const payload = { ...socio, usuarioId };
  const res = await fetch(SOCIOS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Error HTTP ${res.status} — guardar socio`);
  const raw: SocioNegocioRaw = await res.json();
  return normalizeSocio(raw);
};

/** Elimina un socio por su ID */
export const deleteSocio = async (id: number): Promise<void> => {
  const res = await fetch(`${SOCIOS_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Error HTTP ${res.status} — eliminar socio`);
};

// ─── Ubigeos: Cascada Departamento → Provincia → Distrito ────────────────────

/** Retorna la lista de departamentos disponibles (strings únicos) */
export const getDepartamentos = (): Promise<string[]> =>
  fetchJson<string[]>(`${UBIGEOS_URL}/departamentos`);

/** Retorna las provincias de un departamento */
export const getProvincias = (departamento: string): Promise<string[]> =>
  fetchJson<string[]>(
    `${UBIGEOS_URL}/provincias?departamento=${encodeURIComponent(departamento)}`
  );

/**
 * Retorna los distritos (objetos Ubigeo completos) de un departamento + provincia.
 * Cada objeto incluye el código ubigeo de 6 dígitos que se enviará al backend.
 */
export const getDistritos = (
  departamento: string,
  provincia: string
): Promise<Ubigeo[]> =>
  fetchJson<Ubigeo[]>(
    `${UBIGEOS_URL}/distritos?departamento=${encodeURIComponent(departamento)}&provincia=${encodeURIComponent(provincia)}`
  );

export const getUbigeoByCode = (codigo: string): Promise<Ubigeo> =>
  fetchJson<Ubigeo>(`${UBIGEOS_URL}/ubigeos/${codigo}`);
