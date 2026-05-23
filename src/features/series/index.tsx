import { useCallback, useEffect, useState } from 'react';

import { BookOpen, Edit, Hash, Loader2, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { ConfirmDialog } from '@/components/confirm-dialog';
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
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';

import { deleteSerie, getSeries, getTiposComprobante, saveSerie } from './api';
import type { Serie, TipoComprobante } from './types';

// ─── Formulario vacío ─────────────────────────────────────────────────────────

const EMPTY_FORM: Omit<Serie, 'id'> = {
  usuarioId: 0,
  tipoComprobanteId: 0,
  serie: '',
  correlativoActual: 0,
  activo: true,
};

// ─── Badge de estado Activo / Inactivo ────────────────────────────────────────

function EstadoBadge({ activo }: { activo: boolean }) {
  return activo ? (
    <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
      Activa
    </Badge>
  ) : (
    <Badge className="border-slate-200 bg-slate-100 text-slate-500">
      Inactiva
    </Badge>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SeriesPage() {
  const { dbUser } = useAuth();
  const currentUserId = dbUser?.id;

  // ── Estado de la lista ──
  const [series, setSeries] = useState<Serie[]>([]);
  const [tiposComprobante, setTiposComprobante] = useState<TipoComprobante[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ── Estado del modal CRUD ──
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Serie, 'id'> & { id?: number }>(EMPTY_FORM);

  // ── Estado de eliminación ──
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ─── Lookup: tipoComprobanteId → descripción ─────────────────────────────

  const labelComprobante = useCallback(
    (tipoComprobanteId: number) => {
      const tc = tiposComprobante.find((t) => t.id === tipoComprobanteId);
      if (!tc) return `#${tipoComprobanteId}`;
      return `${tc.codigoSunat} – ${tc.descripcion}`;
    },
    [tiposComprobante]
  );

  // ─── Carga de datos ──────────────────────────────────────────────────────

  const cargarDatos = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [seriesData, tiposData] = await Promise.all([
        getSeries(currentUserId),
        getTiposComprobante(),
      ]);
      setSeries(seriesData);
      setTiposComprobante(tiposData);
    } catch {
      toast.error('Error al cargar los datos desde el servidor.');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ─── Filtro de búsqueda ──────────────────────────────────────────────────

  const seriesFiltradas = series.filter((s) => {
    const term = search.toLowerCase();
    const nombre = labelComprobante(s.tipoComprobanteId).toLowerCase();
    return (
      s.serie.toLowerCase().includes(term) ||
      nombre.includes(term)
    );
  });

  // ─── Apertura del modal ──────────────────────────────────────────────────

  const openCreate = () => {
    setFormData({ ...EMPTY_FORM, usuarioId: currentUserId ?? 0 });
    setIsOpen(true);
  };

  const openEdit = (s: Serie) => {
    setFormData({ ...s });
    setIsOpen(true);
  };

  // ─── Submit del formulario ───────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    if (!formData.tipoComprobanteId) {
      toast.error('Selecciona un tipo de comprobante.');
      return;
    }
    if (!formData.serie.trim()) {
      toast.error('El campo serie es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      await saveSerie(formData, currentUserId);
      toast.success(
        formData.id ? 'Serie actualizada con éxito.' : 'Serie registrada con éxito.'
      );
      setIsOpen(false);
      await cargarDatos();
    } catch {
      toast.error('Ocurrió un error al intentar guardar la serie.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Eliminación con ConfirmDialog ───────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSerie(deleteTarget.id);
      toast.success('Serie eliminada correctamente.');
      await cargarDatos();
    } catch {
      toast.error('No se pudo eliminar. Puede estar referenciada en comprobantes emitidos.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ─── Helper de actualización de campos del formulario ───────────────────

  const set = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="animate-in fade-in-0 space-y-6 p-6">

      {/* ── Encabezado ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-royal-blue flex items-center gap-2 text-3xl font-bold tracking-tight">
            <BookOpen className="h-8 w-8" />
            Series de Comprobantes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Configura las series y correlativos para tus documentos electrónicos
          </p>
        </div>
        <Button
          className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-white"
          onClick={openCreate}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Serie
        </Button>
      </div>

      {/* ── Barra de búsqueda ── */}
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          className="pl-9"
          placeholder="Buscar por serie o tipo de comprobante..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Tabla ── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Serie</TableHead>
              <TableHead className="font-semibold text-slate-700">Tipo de Comprobante</TableHead>
              <TableHead className="font-semibold text-slate-700">
                <span className="flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5" />
                  Correlativo Actual
                </span>
              </TableHead>
              <TableHead className="font-semibold text-slate-700">Estado</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando series...
                  </div>
                </TableCell>
              </TableRow>
            ) : seriesFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-28 text-center text-slate-400">
                  {search
                    ? 'No se encontraron series con ese criterio.'
                    : 'No hay series registradas. Haz clic en "Nueva Serie" para comenzar.'}
                </TableCell>
              </TableRow>
            ) : (
              seriesFiltradas.map((s) => (
                <TableRow key={s.id} className="transition-colors hover:bg-slate-50">

                  {/* Serie */}
                  <TableCell>
                    <span className="font-mono text-base font-bold tracking-widest text-slate-800">
                      {s.serie}
                    </span>
                  </TableCell>

                  {/* Tipo de Comprobante — cruzado con el catálogo */}
                  <TableCell className="max-w-[260px]">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">
                        {labelComprobante(s.tipoComprobanteId)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Correlativo */}
                  <TableCell>
                    <span className="font-mono text-sm text-slate-600">
                      {String(s.correlativoActual).padStart(8, '0')}
                    </span>
                  </TableCell>

                  {/* Estado */}
                  <TableCell>
                    <EstadoBadge activo={s.activo} />
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        title="Editar serie"
                        onClick={() => openEdit(s)}
                      >
                        <Edit className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        title="Eliminar serie"
                        onClick={() =>
                          setDeleteTarget({ id: s.id!, nombre: s.serie })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
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
      {!loading && seriesFiltradas.length > 0 && (
        <p className="text-xs text-slate-400">
          Mostrando{' '}
          <span className="font-medium text-slate-600">{seriesFiltradas.length}</span>{' '}
          serie(s) —{' '}
          <span className="text-emerald-600">
            {series.filter((s) => s.activo).length} activas
          </span>{' '}
          /{' '}
          <span className="text-slate-500">
            {series.filter((s) => !s.activo).length} inactivas
          </span>
        </p>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Modal Crear / Editar
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-[480px]"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <BookOpen className="text-royal-blue h-5 w-5" />
              {formData.id ? 'Editar Serie' : 'Registrar Nueva Serie'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2 space-y-5">

            {/* ════ Tipo de Comprobante (Select dinámico) ════ */}
            <div className="space-y-1.5">
              <Label htmlFor="tipoComprobanteId">
                Tipo de Comprobante <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipoComprobanteId ? String(formData.tipoComprobanteId) : ''}
                onValueChange={(v) => set('tipoComprobanteId', Number(v))}
              >
                <SelectTrigger id="tipoComprobanteId">
                  <SelectValue placeholder="Selecciona un comprobante..." />
                </SelectTrigger>
                <SelectContent>
                  {tiposComprobante.map((tc) => (
                    <SelectItem key={tc.id} value={String(tc.id)}>
                      <span className="mr-1.5 font-mono text-xs font-bold text-slate-400">
                        {tc.codigoSunat}
                      </span>
                      {tc.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ════ Serie ════ */}
            <div className="space-y-1.5">
              <Label htmlFor="serie">
                Serie <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serie"
                required
                maxLength={4}
                placeholder="Ej: F001, B001"
                className="font-mono tracking-widest uppercase"
                value={formData.serie}
                onChange={(e) =>
                  set('serie', e.target.value.toUpperCase())
                }
              />
              <p className="text-[11px] text-slate-400">
                Máximo 4 caracteres — se transforma automáticamente a mayúsculas.
              </p>
            </div>

            {/* ════ Correlativo Actual ════ */}
            <div className="space-y-1.5">
              <Label htmlFor="correlativoActual">
                Correlativo Actual
              </Label>
              <Input
                id="correlativoActual"
                type="number"
                min={0}
                placeholder="0"
                value={formData.correlativoActual}
                onChange={(e) =>
                  set('correlativoActual', Math.max(0, Number(e.target.value)))
                }
              />
              <p className="text-[11px] text-slate-400">
                El sistema usará el siguiente número al emitir un comprobante.
              </p>
            </div>

            {/* ════ Estado (Switch) ════ */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Estado de la Serie</p>
                <p className="text-xs text-slate-500">
                  {formData.activo
                    ? 'La serie está activa y puede emitir comprobantes.'
                    : 'La serie está inactiva y no puede emitir comprobantes.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${formData.activo ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {formData.activo ? 'Activa' : 'Inactiva'}
                </span>
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => set('activo', checked)}
                />
              </div>
            </div>

            {/* ════ Acciones del formulario ════ */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-white"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : formData.id ? (
                  'Actualizar Serie'
                ) : (
                  'Registrar Serie'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          ConfirmDialog — Eliminación
      ══════════════════════════════════════════════════════════════════════ */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="¿Eliminar esta serie?"
        desc={
          deleteTarget ? (
            <span>
              Estás a punto de eliminar la serie{' '}
              <strong className="font-mono">{deleteTarget.nombre}</strong>. Esta
              acción no se puede deshacer y podría afectar comprobantes ya emitidos.
            </span>
          ) : (
            ''
          )
        }
        confirmText="Sí, eliminar"
        cancelBtnText="Cancelar"
        destructive
        isLoading={deleting}
        handleConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
