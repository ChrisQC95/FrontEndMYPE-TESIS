export interface Categoria {
  id?: number;
  nombre: string;
  descripcion?: string;
  usuarioId: number;
}

export interface Producto {
  id?: number;
  usuarioId: number;
  categoriaId?: number | null;
  codigo?: string;
  nombre: string;
  /** 'B' = Bien, 'S' = Servicio */
  tipo: 'B' | 'S';
  /** Ej: 'NIU' (Bienes), 'ZZ' (Servicios), 'KG', 'LT', etc. */
  unidadMedida: string;
  precioVenta: number;
  precioCompra?: number | null;
  afectoIgv?: boolean;
  stockActual?: number | null;
  stockMinimo?: number | null;
}
