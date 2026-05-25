import type { Categoria, Producto } from './types';
import { auth } from "@/lib/firebase";

// Antes: const BASE_URL = 'http://localhost:8080/api';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// ─── Productos ─────────────────────────────────────────────────────────────
const getToken = async (): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No hay una sesión activa');
  return await currentUser.getIdToken();
};

export const getProductos = async (usuarioId: number): Promise<Producto[]> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No hay una sesión activa');
  }

  // 2. Le pedimos el token fresco a Firebase
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/productos/usuario/${usuarioId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al cargar los productos');
  return res.json();
};

export const saveProducto = async (
  producto: Omit<Producto, 'id'> & { id?: number },
  usuarioId: number
): Promise<Producto> => {
  const token = await getToken();
  const payload: Producto = { ...producto, usuarioId };
  const res = await fetch(`${BASE_URL}/productos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al guardar el producto');
  return res.json();
};

export const deleteProducto = async (id: number): Promise<void> => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/productos/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al eliminar el producto');
};

// ─── Categorías (para el Select del formulario) ────────────────────────────

export const getCategorias = async (usuarioId: number): Promise<Categoria[]> => {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/categorias/usuario/${usuarioId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al cargar las categorías');
  return res.json();
};
