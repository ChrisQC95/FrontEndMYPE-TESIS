import { Categoria } from './types';

const API_URL = 'http://localhost:8080/api/categorias';
// Placeholder temporal del usuario. Luego lo cambiaremos por el AuthContext
//const USUARIO_ID = 1;

export const getCategorias = async (usuarioId: number): Promise<Categoria[]> => {
  const response = await fetch(`${API_URL}/usuario/${usuarioId}`);
  if (!response.ok) throw new Error('Error al cargar las categorías');
  return response.json();
};

export const saveCategoria = async (categoria: Categoria, usuarioId: number): Promise<Categoria> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...categoria, usuarioId }),
  });
  if (!response.ok) throw new Error('Error al guardar la categoría');
  return response.json();
};

export const deleteCategoria = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Error al eliminar la categoría');
};