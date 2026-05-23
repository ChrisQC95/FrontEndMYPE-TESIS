export interface Conductor {
  id?: number;
  usuarioId: number;
  /** '01' = DNI, '04' = Carné de Extranjería, '06' = RUC, '07' = Pasaporte, 'A4' = Carné Diplomático */
  tipoDocumento: string;
  numeroDocumento: string;
  nombreCompleto: string;
  licenciaConducir: string;
  activo: boolean;
}
