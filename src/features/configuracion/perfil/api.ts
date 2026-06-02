import { auth } from "@/lib/firebase";
import type { EmpresaPerfilDTO } from './types';

const PERFIL_URL = `${import.meta.env.VITE_API_URL}/api/empresa-configuracion`;

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
  if (!res.ok) {
    try {
      const errData = await res.json();
      throw new Error(errData.error || `Error HTTP ${res.status} — ${url}`);
    } catch (e) {
      if (e instanceof Error && e.message !== 'Unexpected end of JSON input' && !e.message.startsWith('Unexpected token')) {
        throw e;
      }
      throw new Error(`Error HTTP ${res.status} — ${url}`);
    }
  }

  return res.json() as Promise<T>;
}

/** Obtiene el perfil de empresa de un usuario específico */
export const getEmpresaPerfil = async (usuarioId: number): Promise<EmpresaPerfilDTO> => {
  return fetchJson<EmpresaPerfilDTO>(`${PERFIL_URL}/usuario/${usuarioId}`);
};

/** Crea o actualiza el perfil de empresa */
export const saveEmpresaPerfil = async (dto: EmpresaPerfilDTO): Promise<EmpresaPerfilDTO> => {
  return fetchJson<EmpresaPerfilDTO>(PERFIL_URL, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
};

/** Sube un archivo de imagen al servidor y retorna su URL pública de Supabase.
 *  @param formData - FormData ya construido con 'file' y 'folder' como claves
 */
export const uploadImageFile = async (formData: FormData): Promise<string> => {
  const token = await getToken();

  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/storage/upload`, {
    method: 'POST',
    headers: {
      // NO establecer Content-Type aquí; el navegador lo añade automáticamente
      // con el boundary correcto para multipart/form-data
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error HTTP ${res.status} al subir imagen: ${errorText}`);
  }

  const data = await res.json();
  return data.url as string;
};
