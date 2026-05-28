/**
 * Refleja fielmente la tabla `cuentas_bancarias`.
 */
export interface CuentaBancaria {
  id?: number;
  usuarioId: number;
  banco: string;
  moneda: string;
  numeroCuenta: string;
  cci: string;
  activo: boolean;
}
