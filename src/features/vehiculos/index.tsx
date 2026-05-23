import { useEffect, useState } from 'react';

import { Car, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { useConfirmStore } from '@/stores/useConfirmStore';

import { deleteVehiculo, getVehiculos, saveVehiculo } from './api';
import type { Vehiculo } from './types';

// ─── Constante del formulario vacío ────────────────────────────────────────

const EMPTY_FORM: Omit<Vehiculo, 'id'> = {
  usuarioId: 0,
  placa: '',
  marca: '',
  modelo: '',
  activo: true,
};

// ─── Componente principal ───────────────────────────────────────────────────

export default function VehiculosPage() {
  const { dbUser } = useAuth();
  const currentUserId = dbUser?.id;
  const openConfirm = useConfirmStore((state) => state.openConfirm);

  // ── Estado ──
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ── Modal ──
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Vehiculo, 'id'> & { id?: number }>(EMPTY_FORM);

  // ─── Carga de datos ──────────────────────────────────────────────────────

  const cargarDatos = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getVehiculos(currentUserId);
      setVehiculos(data);
    } catch {
      toast.error('Error al cargar los vehículos desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ─── Filtro en tiempo real ───────────────────────────────────────────────

  const vehiculosFiltrados = vehiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(search.toLowerCase()) ||
      (v.marca ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (v.modelo ?? '').toLowerCase().includes(search.toLowerCase())
  );

  // ─── Handlers ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setFormData({ ...EMPTY_FORM, usuarioId: currentUserId ?? 0 });
    setIsOpen(true);
  };

  const openEdit = (v: Vehiculo) => {
    setFormData({ ...v });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    setSaving(true);
    try {
      await saveVehiculo(formData, currentUserId);
      toast.success(formData.id ? 'Vehículo actualizado con éxito.' : 'Vehículo registrado con éxito.');
      setIsOpen(false);
      await cargarDatos();
    } catch {
      toast.error('Ocurrió un error al intentar guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number, placa: string) => {
    openConfirm({
      title: `¿Eliminar el vehículo ${placa}?`,
      description: 'Esta acción no se puede deshacer. El vehículo será eliminado permanentemente del sistema.',
      onConfirm: async () => {
        try {
          await deleteVehiculo(id);
          toast.success('Vehículo eliminado correctamente.');
          await cargarDatos();
        } catch {
          toast.error('No se pudo eliminar. Puede estar referenciado en algún registro.');
        }
      },
    });
  };

  // ─── Helper de formulario ────────────────────────────────────────────────

  const set = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className='animate-in fade-in-0 space-y-6 p-6'>
      {/* ── Encabezado ── */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-royal-blue flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <Car className='h-8 w-8' />
            Vehículos
          </h1>
          <p className='mt-1 text-sm text-slate-500'>
            Gestiona la flota de vehículos de tu empresa
          </p>
        </div>
        <Button
          className='bg-vibrant-orange hover:bg-vibrant-orange/90 text-white'
          onClick={openCreate}
        >
          <Plus className='mr-2 h-4 w-4' />
          Nuevo Vehículo
        </Button>
      </div>

      {/* ── Barra de búsqueda ── */}
      <div className='relative max-w-sm'>
        <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
        <Input
          className='pl-9'
          placeholder='Buscar por placa, marca o modelo...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Tabla ── */}
      <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        <Table>
          <TableHeader className='bg-slate-50'>
            <TableRow>
              <TableHead className='font-semibold text-slate-700'>Placa</TableHead>
              <TableHead className='font-semibold text-slate-700'>Marca</TableHead>
              <TableHead className='font-semibold text-slate-700'>Modelo</TableHead>
              <TableHead className='font-semibold text-slate-700'>Estado</TableHead>
              <TableHead className='text-right font-semibold text-slate-700'>Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className='h-28 text-center text-slate-400'>
                  <div className='flex items-center justify-center gap-2'>
                    <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600' />
                    Cargando vehículos...
                  </div>
                </TableCell>
              </TableRow>
            ) : vehiculosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='h-28 text-center text-slate-400'>
                  {search
                    ? 'No se encontraron vehículos con ese criterio de búsqueda.'
                    : 'No hay vehículos registrados. Haz clic en "Nuevo Vehículo" para comenzar.'}
                </TableCell>
              </TableRow>
            ) : (
              vehiculosFiltrados.map((v) => (
                <TableRow key={v.id} className='transition-colors hover:bg-slate-50'>
                  {/* Placa — monospace para mejor lectura */}
                  <TableCell>
                    <span className='rounded bg-slate-100 px-2 py-0.5 font-mono text-sm font-bold tracking-widest text-slate-800'>
                      {v.placa}
                    </span>
                  </TableCell>

                  {/* Marca */}
                  <TableCell className='font-medium text-slate-900'>
                    {v.marca || <span className='text-slate-400'>—</span>}
                  </TableCell>

                  {/* Modelo */}
                  <TableCell className='text-slate-600'>
                    {v.modelo || <span className='text-slate-400'>—</span>}
                  </TableCell>

                  {/* Estado Badge */}
                  <TableCell>
                    {v.activo ? (
                      <Badge className='border-emerald-200 bg-emerald-50 text-emerald-700'>
                        Activo
                      </Badge>
                    ) : (
                      <Badge className='border-slate-200 bg-slate-100 text-slate-500'>
                        Inactivo
                      </Badge>
                    )}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='outline'
                        size='icon'
                        title='Editar'
                        onClick={() => openEdit(v)}
                      >
                        <Edit className='h-4 w-4 text-slate-600' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='icon'
                        title='Eliminar'
                        onClick={() => handleDelete(v.id!, v.placa)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Resumen ── */}
      {!loading && vehiculosFiltrados.length > 0 && (
        <p className='text-xs text-slate-400'>
          Mostrando{' '}
          <span className='font-medium text-slate-600'>{vehiculosFiltrados.length}</span>{' '}
          vehículo(s) —{' '}
          <span className='text-emerald-600'>
            {vehiculosFiltrados.filter((v) => v.activo).length} Activos
          </span>{' '}
          /{' '}
          <span className='text-slate-500'>
            {vehiculosFiltrados.filter((v) => !v.activo).length} Inactivos
          </span>
        </p>
      )}

      {/* ── Modal Crear / Editar ── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-xl font-bold'>
              <Car className='text-royal-blue h-5 w-5' />
              {formData.id ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='mt-4 space-y-5'>

            {/* ── Placa ── */}
            <div className='space-y-1.5'>
              <Label htmlFor='placa'>
                Placa <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='placa'
                required
                maxLength={10}
                placeholder='Ej: ABC-123'
                value={formData.placa}
                className='font-mono uppercase tracking-widest'
                onChange={(e) => set('placa', e.target.value.toUpperCase())}
              />
              <p className='text-[11px] text-slate-400'>
                Se convierte a mayúsculas automáticamente.
              </p>
            </div>

            {/* ── Marca + Modelo ── */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='marca'>Marca</Label>
                <Input
                  id='marca'
                  placeholder='Ej: Toyota'
                  value={formData.marca ?? ''}
                  onChange={(e) => set('marca', e.target.value)}
                />
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='modelo'>Modelo</Label>
                <Input
                  id='modelo'
                  placeholder='Ej: Hilux 4x4'
                  value={formData.modelo ?? ''}
                  onChange={(e) => set('modelo', e.target.value)}
                />
              </div>
            </div>

            {/* ── Estado Activo ── */}
            <div className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3'>
              <div>
                <p className='text-sm font-medium text-slate-700'>Estado del vehículo</p>
                <p className='text-xs text-slate-500'>
                  {formData.activo
                    ? 'El vehículo está disponible para operaciones.'
                    : 'El vehículo está fuera de servicio.'}
                </p>
              </div>
              {/* Toggle visual: clic alterna el estado */}
              <button
                type='button'
                role='switch'
                aria-checked={formData.activo}
                onClick={() => set('activo', !formData.activo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  formData.activo
                    ? 'bg-emerald-500 focus:ring-emerald-400'
                    : 'bg-slate-300 focus:ring-slate-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    formData.activo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* ── Botón envío ── */}
            <Button
              type='submit'
              disabled={saving}
              className='bg-royal-blue hover:bg-royal-blue/90 w-full text-white'
            >
              {saving ? (
                <span className='flex items-center gap-2'>
                  <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Guardando...
                </span>
              ) : formData.id ? (
                'Guardar Cambios'
              ) : (
                'Registrar Vehículo'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
