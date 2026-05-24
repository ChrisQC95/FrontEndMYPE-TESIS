import type { Categoria, Producto } from './types';

// Antes: const BASE_URL = 'http://localhost:8080/api';

const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// ─── Productos ─────────────────────────────────────────────────────────────

export const getProductos = async (usuarioId: number): Promise<Producto[]> => {
  const res = await fetch(`${BASE_URL}/productos/usuario/${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar los productos');
  return res.json();
};

export const saveProducto = async (
  producto: Omit<Producto, 'id'> & { id?: number },
  usuarioId: number
): Promise<Producto> => {
  const payload: Producto = { ...producto, usuarioId };
  const res = await fetch(`${BASE_URL}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Error al guardar el producto');
  return res.json();
};

export const deleteProducto = async (id: number): Promise<void> => {
  const res = await fetch(`${BASE_URL}/productos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar el producto');
};

// ─── Categorías (para el Select del formulario) ────────────────────────────

export const getCategorias = async (usuarioId: number): Promise<Categoria[]> => {
  const res = await fetch(`${BASE_URL}/categorias/usuario/${usuarioId}`);
  if (!res.ok) throw new Error('Error al cargar las categorías');
  return res.json();
};
