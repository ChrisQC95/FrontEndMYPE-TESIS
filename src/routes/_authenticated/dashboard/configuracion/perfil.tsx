import { createFileRoute } from '@tanstack/react-router';
import PerfilEmpresaPage from '@/features/configuracion/perfil';

export const Route = createFileRoute(
  '/_authenticated/dashboard/configuracion/perfil',
)({
  component: () => <PerfilEmpresaPage />,
});
