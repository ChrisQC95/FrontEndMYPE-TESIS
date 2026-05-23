// ─── Ubigeo ──────────────────────────────────────────────────────────────────
/** Objeto devuelto por GET /api/ubigeos/distritos */
export interface Ubigeo {
  /** Código de 6 dígitos — PK en la tabla ubigeos */
  ubigeo: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

// ─── Socio de Negocio ─────────────────────────────────────────────────────────
/**
 * Refleja fielmente la tabla `socios_negocio`.
 * El único campo de ubicación que viaja al backend es `ubigeo`.
 */
export interface SocioNegocio {
  id?: number;
  usuarioId: number;
  /** 'C' = Cliente | 'P' = Proveedor | 'A' = Ambos */
  tipoSocio: 'C' | 'P' | 'A';
  /** '01'=DNI | '04'=Carné Extranjería | '06'=RUC | '07'=Pasaporte | 'A4'=Carné Diplomático */
  tipoDocumento: string;
  numeroDocumento: string;
  /** 'Natural' | 'Jurídica' — auto-inferido del número de RUC */
  tipoPersona?: string | null;
  nombreRazonSocial: string;
  direccionFiscal?: string | null;
  /** Código ubigeo de 6 dígitos (FK → tabla ubigeos). Único campo de ubicación enviado al backend. */
  ubigeo?: string | null;
  telefonoMovil?: string | null;
  telefonoFijo?: string | null;
  emailFacturacion?: string | null;
}
