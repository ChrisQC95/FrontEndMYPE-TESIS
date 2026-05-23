export interface Vehiculo {
  id?: number;
  usuarioId: number;
  placa: string;
  marca?: string;
  modelo?: string;
  activo: boolean;
}
