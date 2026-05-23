// ─── Tipo Comprobante (catálogo SUNAT) ───────────────────────────────────────
/**
 * Refleja la tabla `tipos_comprobante`.
 * Se carga desde GET /api/catalogos-sunat/tipos-comprobante
 */
export interface TipoComprobante {
  id: number;
  /** Código SUNAT de 2 caracteres. Ej: '01' = Factura, '03' = Boleta */
  codigoSunat: string;
  /** Descripción legible. Ej: 'FACTURA ELECTRÓNICA' */
  descripcion: string;
  requiereClienteRuc: boolean;
}

// ─── Serie ───────────────────────────────────────────────────────────────────
/**
 * Refleja fielmente la tabla `series`.
 * Cada serie vincula un usuario a un tipo de comprobante con una clave alfanumérica
 * de 4 caracteres (Ej: 'F001', 'B001') y lleva un correlativo interno.
 */
export interface Serie {
  id?: number;
  usuarioId: number;
  /** FK → tipos_comprobante.id */
  tipoComprobanteId: number;
  /** 4 caracteres en MAYÚSCULAS. Ej: 'F001' */
  serie: string;
  /** Último número correlativo emitido. Inicia en 0. */
  correlativoActual: number;
  activo: boolean;
}
