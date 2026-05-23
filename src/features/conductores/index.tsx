import { useEffect, useState } from 'react';

import { Edit, Plus, Search, Trash2, UserCheck } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

import { deleteConductor, getConductores, saveConductor } from './api';
import type { Conductor } from './types';

// ─── Catálogo de tipos de documento (SUNAT) ─────────────────────────────────

const TIPOS_DOCUMENTO = [
  { value: '01', label: 'DNI' },
  { value: '04', label: 'Carné de Extranjería' },
  { value: '06', label: 'RUC' },
  { value: '07', label: 'Pasaporte' },
  { value: 'A4', label: 'Carné Diplomático' },
];

// ─── Constante del formulario vacío ─────────────────────────────────────────

const EMPTY_FORM: Omit<Conductor, 'id'> = {
  usuarioId: 0,
  tipoDocumento: '01',
  numeroDocumento: '',
  nombreCompleto: '',
  licenciaConducir: '',
  activo: true,
};

// ─── Helper: etiqueta legible del tipo de documento ─────────────────────────

const labelTipoDoc = (code: string) =>
  TIPOS_DOCUMENTO.find((t) => t.value === code)?.label ?? code;

// ─── Máxima longitud del número de documento según tipo ─────────────────────

const maxLengthDoc = (tipo: string) => {
  if (tipo === '01') return 8;   // DNI
  if (tipo === '06') return 11;  // RUC
  if (tipo === '07') return 12;  // Pasaporte
  return 15;                     // Resto
};

// ─── Componente principal ────────────────────────────────────────────────────

export default function ConductoresPage() {
  const { dbUser } = useAuth();
  const currentUserId = dbUser?.id;
  const openConfirm = useConfirmStore((state) => state.openConfirm);

  // ── Estado ──
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ── Modal ──
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Conductor, 'id'> & { id?: number }>(EMPTY_FORM);

  // ─── Carga de datos ───────────────────────────────────────────────────────

  const cargarDatos = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getConductores(currentUserId);
      setConductores(data);
    } catch {
      toast.error('Error al cargar los conductores desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId]);

  // ─── Filtro en tiempo real ────────────────────────────────────────────────

  const conductoresFiltrados = conductores.filter(
    (c) =>
      c.nombreCompleto.toLowerCase().includes(search.toLowerCase()) ||
      c.numeroDocumento.includes(search) ||
      c.licenciaConducir.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Handlers ────────────────────────────────────────────────────────────

  const openCreate = () => {
    setFormData({ ...EMPTY_FORM, usuarioId: currentUserId ?? 0 });
    setIsOpen(true);
  };

  const openEdit = (c: Conductor) => {
    setFormData({ ...c });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    setSaving(true);
    try {
      await saveConductor(formData, currentUserId);
      toast.success(
        formData.id ? 'Conductor actualizado con éxito.' : 'Conductor registrado con éxito.'
      );
      setIsOpen(false);
      await cargarDatos();
    } catch {
      toast.error('Ocurrió un error al intentar guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number, nombre: string) => {
    openConfirm({
      title: `¿Eliminar al conductor "${nombre}"?`,
      description:
        'Esta acción no se puede deshacer. El conductor será eliminado permanentemente del sistema.',
      onConfirm: async () => {
        try {
          await deleteConductor(id);
          toast.success('Conductor eliminado correctamente.');
          await cargarDatos();
        } catch {
          toast.error('No se pudo eliminar. Puede estar referenciado en algún registro.');
        }
      },
    });
  };

  // ─── Helper de formulario ─────────────────────────────────────────────────

  const set = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // Al cambiar tipo de documento, limpiamos el número para evitar datos inválidos
  const handleTipoDocChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipoDocumento: value, numeroDocumento: '' }));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className='animate-in fade-in-0 space-y-6 p-6'>

      {/* ── Encabezado ── */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-royal-blue flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <UserCheck className='h-8 w-8' />
            Conductores
          </h1>
          <p className='mt-1 text-sm text-slate-500'>
            Gestiona el registro de conductores habilitados
          </p>
        </div>
        <Button
          className='bg-vibrant-orange hover:bg-vibrant-orange/90 text-white'
          onClick={openCreate}
        >
          <Plus className='mr-2 h-4 w-4' />
          Nuevo Conductor
        </Button>
      </div>

      {/* ── Barra de búsqueda ── */}
      <div className='relative max-w-sm'>
        <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
        <Input
          className='pl-9'
          placeholder='Buscar por nombre, documento o licencia...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Tabla ── */}
      <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        <Table>
          <TableHeader className='bg-slate-50'>
            <TableRow>
              <TableHead className='font-semibold text-slate-700'>Nombre Completo</TableHead>
              <TableHead className='font-semibold text-slate-700'>Tipo Doc.</TableHead>
              <TableHead className='font-semibold text-slate-700'>N° Documento</TableHead>
              <TableHead className='font-semibold text-slate-700'>Licencia</TableHead>
              <TableHead className='font-semibold text-slate-700'>Estado</TableHead>
              <TableHead className='text-right font-semibold text-slate-700'>Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className='h-28 text-center text-slate-400'>
                  <div className='flex items-center justify-center gap-2'>
                    <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600' />
                    Cargando conductores...
                  </div>
                </TableCell>
              </TableRow>
            ) : conductoresFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-28 text-center text-slate-400'>
                  {search
                    ? 'No se encontraron conductores con ese criterio.'
                    : 'No hay conductores registrados. Haz clic en "Nuevo Conductor" para comenzar.'}
                </TableCell>
              </TableRow>
            ) : (
              conductoresFiltrados.map((c) => (
                <TableRow key={c.id} className='transition-colors hover:bg-slate-50'>

                  {/* Nombre */}
                  <TableCell className='font-medium text-slate-900'>
                    {c.nombreCompleto}
                  </TableCell>

                  {/* Tipo documento — badge discreto */}
                  <TableCell>
                    <span className='rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600'>
                      {labelTipoDoc(c.tipoDocumento)}
                    </span>
                  </TableCell>

                  {/* Número documento */}
                  <TableCell className='font-mono text-sm text-slate-700'>
                    {c.numeroDocumento}
                  </TableCell>

                  {/* Licencia — monospace, mayúsculas */}
                  <TableCell>
                    <span className='rounded bg-blue-50 px-2 py-0.5 font-mono text-sm font-bold tracking-widest text-blue-700'>
                      {c.licenciaConducir}
                    </span>
                  </TableCell>

                  {/* Estado Badge */}
                  <TableCell>
                    {c.activo ? (
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
                        onClick={() => openEdit(c)}
                      >
                        <Edit className='h-4 w-4 text-slate-600' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='icon'
                        title='Eliminar'
                        onClick={() => handleDelete(c.id!, c.nombreCompleto)}
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
      {!loading && conductoresFiltrados.length > 0 && (
        <p className='text-xs text-slate-400'>
          Mostrando{' '}
          <span className='font-medium text-slate-600'>{conductoresFiltrados.length}</span>{' '}
          conductor(es) —{' '}
          <span className='text-emerald-600'>
            {conductoresFiltrados.filter((c) => c.activo).length} Activos
          </span>{' '}
          /{' '}
          <span className='text-slate-500'>
            {conductoresFiltrados.filter((c) => !c.activo).length} Inactivos
          </span>
        </p>
      )}

      {/* ── Modal Crear / Editar ── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[520px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-xl font-bold'>
              <UserCheck className='text-royal-blue h-5 w-5' />
              {formData.id ? 'Editar Conductor' : 'Registrar Nuevo Conductor'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='mt-4 space-y-5'>

            {/* ── Nombre Completo ── */}
            <div className='space-y-1.5'>
              <Label htmlFor='nombreCompleto'>
                Nombre Completo <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='nombreCompleto'
                required
                maxLength={200}
                placeholder='Ej: García López, Juan Carlos'
                value={formData.nombreCompleto}
                onChange={(e) => set('nombreCompleto', e.target.value)}
              />
            </div>

            {/* ── Tipo de Documento + Número ── */}
            <div className='grid grid-cols-5 gap-3'>
              <div className='col-span-2 space-y-1.5'>
                <Label htmlFor='tipoDocumento'>
                  Tipo Doc. <span className='text-red-500'>*</span>
                </Label>
                <Select value={formData.tipoDocumento} onValueChange={handleTipoDocChange}>
                  <SelectTrigger id='tipoDocumento'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_DOCUMENTO.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className='font-mono text-xs font-bold text-slate-500 mr-1'>
                          {t.value}
                        </span>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='col-span-3 space-y-1.5'>
                <Label htmlFor='numeroDocumento'>
                  N° Documento <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='numeroDocumento'
                  required
                  inputMode='numeric'
                  maxLength={maxLengthDoc(formData.tipoDocumento)}
                  placeholder={formData.tipoDocumento === '01' ? '00000000' : '...'}
                  value={formData.numeroDocumento}
                  className='font-mono tracking-wider'
                  onChange={(e) =>
                    set('numeroDocumento', e.target.value.replace(/\D/g, '').slice(0, maxLengthDoc(formData.tipoDocumento)))
                  }
                />
                <p className='text-[11px] text-slate-400'>
                  Máx. {maxLengthDoc(formData.tipoDocumento)} dígitos para{' '}
                  {labelTipoDoc(formData.tipoDocumento)}.
                </p>
              </div>
            </div>

            {/* ── Licencia de Conducir ── */}
            <div className='space-y-1.5'>
              <Label htmlFor='licenciaConducir'>
                Licencia de Conducir <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='licenciaConducir'
                required
                maxLength={20}
                placeholder='Ej: Q12345678'
                value={formData.licenciaConducir}
                className='font-mono uppercase tracking-widest'
                onChange={(e) => set('licenciaConducir', e.target.value.toUpperCase())}
              />
              <p className='text-[11px] text-slate-400'>
                Se convierte a mayúsculas automáticamente.
              </p>
            </div>

            {/* ── Estado Activo (toggle) ── */}
            <div className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3'>
              <div>
                <p className='text-sm font-medium text-slate-700'>Estado del conductor</p>
                <p className='text-xs text-slate-500'>
                  {formData.activo
                    ? 'El conductor está habilitado para operar.'
                    : 'El conductor está inhabilitado.'}
                </p>
              </div>
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
                'Registrar Conductor'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
