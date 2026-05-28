export interface EmpresaPerfilDTO {
  usuarioId: number;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccionFiscal: string;
  telefono: string;
  emailContacto: string;
  logoUrl: string; // Base64 de la imagen
}
