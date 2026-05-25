import { Categoria } from './types';
import { auth } from "@/lib/firebase";
// Antes: const API_URL = 'http://localhost:8080/api/categorias';

const API_URL = `${import.meta.env.VITE_API_URL}/api/categorias`;
// Placeholder temporal del usuario. Luego lo cambiaremos por el AuthContext
//const USUARIO_ID = 1;

const getToken = async (): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No hay una sesión activa');
  return await currentUser.getIdToken();
};

export const getCategorias = async (usuarioId: number): Promise<Categoria[]> => {
  // 1. Verificamos que exista un usuario logueado en Firebase
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No hay una sesión activa');
  }

  // 2. Le pedimos el token fresco a Firebase
  const token = await getToken();

  // 3. Hacemos el fetch incluyendo los headers con el Authorization
  const response = await fetch(`${API_URL}/usuario/${usuarioId}`, {
    method: 'GET', // Siempre es buena práctica especificar el método
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // <--- Tu pase VIP
    }
  });

  if (!response.ok) throw new Error('Error al cargar las categorías');
  return response.json();
};

export const saveCategoria = async (categoria: Categoria, usuarioId: number): Promise<Categoria> => {
  const token = await getToken();
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ ...categoria, usuarioId }),
  });
  if (!response.ok) throw new Error('Error al guardar la categoría');
  return response.json();
};

export const deleteCategoria = async (id: number): Promise<void> => {
  const token = await getToken();
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Error al eliminar la categoría');
};