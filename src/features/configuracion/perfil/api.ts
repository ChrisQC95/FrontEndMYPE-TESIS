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
  if (!res.ok) throw new Error(`Error HTTP ${res.status} — ${url}`);

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

/** Sube un archivo de imagen al servidor y retorna su URL pública */
export const uploadImageFile = async (file: File): Promise<string> => {
  const token = await getToken();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'logos'); // Subimos a la carpeta logos

  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/storage/upload`, {
    method: 'POST',
    headers: {
      // Importante: No establecer Content-Type, el navegador lo añade automáticamente con el boundary para FormData
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Error HTTP ${res.status} al subir imagen`);
  }

  const data = await res.json();
  return data.url;
};
