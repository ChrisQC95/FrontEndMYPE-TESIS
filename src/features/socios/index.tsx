import { useCallback, useEffect, useRef, useState } from 'react';

import { Building2, Edit, Loader2, MapPin, Plus, Search, Trash2 } from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';

import {
  deleteSocio,
  getDepartamentos,
  getDistritos,
  getProvincias,
  getSocios,
  saveSocio, getUbigeoByCode,
} from './api';
import type { SocioNegocio, Ubigeo } from './types';

// ─── Catálogos estáticos ──────────────────────────────────────────────────────

const TIPOS_DOCUMENTO = [
  { value: '01', label: 'DNI' },
  { value: '04', label: 'Carné de Extranjería' },
  { value: '06', label: 'RUC' },
  { value: '07', label: 'Pasaporte' },
  { value: 'A4', label: 'Carné Diplomático' },
] as const;

const TIPOS_SOCIO = [
  { value: 'C', label: 'Cliente' },
  { value: 'P', label: 'Proveedor' },
  { value: 'A', label: 'Ambos' },
] as const;

// ─── Formulario vacío (alineado con nueva tabla SQL) ─────────────────────────

const EMPTY_FORM: Omit<SocioNegocio, 'id'> = {
  usuarioId: 0,
  tipoSocio: 'C',
  tipoDocumento: '01',
  numeroDocumento: '',
  tipoPersona: 'Natural',
  nombreRazonSocial: '',
  direccionFiscal: null,
  ubigeo: null,
  telefonoMovil: null,
  telefonoFijo: null,
  emailFacturacion: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const labelTipoDoc = (code: string) =>
  TIPOS_DOCUMENTO.find((t) => t.value === code)?.label ?? code;

/** Infiere tipo de persona según tipo_documento y numero_documento */
const inferirTipoPersona = (tipoDoc: string, numDoc: string): string => {
  if (tipoDoc === '06' && numDoc.startsWith('20')) return 'Jurídica';
  return 'Natural';
};

/** Badge visual según tipo_socio */
function TipoSocioBadge({ tipo }: { tipo: string }) {
  if (tipo === 'C')
    return <Badge className='border-blue-200 bg-blue-50 text-blue-700'>Cliente</Badge>;
  if (tipo === 'P')
    return (
      <Badge className='border-violet-200 bg-violet-50 text-violet-700'>Proveedor</Badge>
    );
  return (
    <Badge className='border-orange-200 bg-orange-50 text-orange-700'>Ambos</Badge>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SociosPage() {
  const { dbUser } = useAuth();
  const currentUserId = dbUser?.id;

  // ── Estado de la lista ──
  const [socios, setSocios] = useState<SocioNegocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'C' | 'P' | 'A'>('todos');

  // ── Estado del modal CRUD ──
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<SocioNegocio, 'id'> & { id?: number }>(
    EMPTY_FORM
  );

  // ── Estado de eliminación ──
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    nombre: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Estado de la cascada de Ubigeos ──
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [distritos, setDistritos] = useState<Ubigeo[]>([]);

  const [selectedDep, setSelectedDep] = useState<string>('');
  const [selectedProv, setSelectedProv] = useState<string>('');
  const [selectedUbigeo, setSelectedUbigeo] = useState<string>('');

  const [loadingDep, setLoadingDep] = useState(false);
  const [loadingProv, setLoadingProv] = useState(false);
  const [loadingDist, setLoadingDist] = useState(false);

  // Ref para abortar la hidratación si el modal se cierra antes de terminar
  const hydrateAbortRef = useRef<AbortController | null>(null);
  const isHydratingRef = useRef(false);
  // ─── Carga de la lista de socios ─────────────────────────────────────────

  const cargarDatos = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getSocios(currentUserId);
      setSocios(data);
    } catch {
      toast.error('Error al cargar los socios desde el servidor.');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ─── Carga inicial de departamentos cuando el modal abre ─────────────────

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setLoadingDep(true);
    getDepartamentos()
      .then((data) => {
        if (!cancelled) setDepartamentos(data);
      })
      .catch(() => toast.error('No se pudieron cargar los departamentos.'))
      .finally(() => {
        if (!cancelled) setLoadingDep(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // ─── Cascada: Departamento → Provincias ──────────────────────────────────

  /*useEffect(() => {
    if (isHydratingRef.current) return;
    if (!selectedDep) {
      setProvincias([]);
      setDistritos([]);
      setSelectedProv('');
      setSelectedUbigeo('');
      return;
    }
    let cancelled = false;
    setLoadingProv(true);
    setProvincias([]);
    setDistritos([]);
    setSelectedProv('');
    setSelectedUbigeo('');
    getProvincias(selectedDep)
      .then((data) => {
        if (!cancelled) setProvincias(data);
      })
      .catch(() => toast.error('No se pudieron cargar las provincias.'))
      .finally(() => {
        if (!cancelled) setLoadingProv(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDep]);

  // ─── Cascada: Provincia → Distritos ─────────────────────────────────────

  useEffect(() => {
    if (isHydratingRef.current) return;
    if (!selectedDep || !selectedProv) {
      setDistritos([]);
      setSelectedUbigeo('');
      return;
    }
    let cancelled = false;
    setLoadingDist(true);
    setDistritos([]);
    setSelectedUbigeo('');
    getDistritos(selectedDep, selectedProv)
      .then((data) => {
        if (!cancelled) setDistritos(data);
      })
      .catch(() => toast.error('No se pudieron cargar los distritos.'))
      .finally(() => {
        if (!cancelled) setLoadingDist(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDep, selectedProv]);*/
  const handleDepartamentoChange = async (dep: string) => {
    setSelectedDep(dep);
    setSelectedProv('');
    setSelectedUbigeo('');
    setProvincias([]);
    setDistritos([]);

    if (!dep) return;

    setLoadingProv(true);
    try {
      const provs = await getProvincias(dep);
      setProvincias(provs);
    } catch {
      toast.error('Error al cargar las provincias.');
    } finally {
      setLoadingProv(false);
    }
  };

  // ─── Cascada Manual: Provincia → Distritos ───
  const handleProvinciaChange = async (prov: string) => {
    setSelectedProv(prov);
    setSelectedUbigeo('');
    setDistritos([]);

    if (!selectedDep || !prov) return;

    setLoadingDist(true);
    try {
      const dists = await getDistritos(selectedDep, prov);
      setDistritos(dists);
    } catch {
      toast.error('Error al cargar los distritos.');
    } finally {
      setLoadingDist(false);
    }
  };
  // ─── Sincroniza ubigeo seleccionado → formData ───────────────────────────

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ubigeo: selectedUbigeo || null }));
  }, [selectedUbigeo]);

  // ─── Hidratación de ubigeo en modo Editar ────────────────────────────────
  /**
   * Cuando el modal abre con un ubigeo existente, resolvemos la cascada
   * paso a paso para pre-poblar los tres selectores sin una búsqueda exhaustiva.
   * Estrategia eficiente: obtenemos departamentos → provincias del dep → distritos
   * de ese dep+prov, y buscamos el matching por código ubigeo.
   */

  const hydrateUbigeo = useCallback(async (ubigeoCode: string) => {
    hydrateAbortRef.current?.abort();
    const controller = new AbortController();
    hydrateAbortRef.current = controller;

    // BLOQUEAMOS LA CASCADA: Evita que los useEffect borren los datos al setear el departamento
    //isHydratingRef.current = true;

    try {
      setLoadingDep(true);

      // PASO A: Traemos la info exacta de a qué Dep/Prov pertenece este código (1 petición)
      const ubigeoInfo = await getUbigeoByCode(ubigeoCode);
      if (controller.signal.aborted) return;

      // PASO B: Con esa ruta exacta, traemos solo las 3 listas que necesitamos.
      // Usamos Promise.all para hacer las 3 peticiones al mismo tiempo y ganar velocidad.
      const [deps, provs, dists] = await Promise.all([
        getDepartamentos(),
        getProvincias(ubigeoInfo.departamento),
        getDistritos(ubigeoInfo.departamento, ubigeoInfo.provincia)
      ]);
      if (controller.signal.aborted) return;

      // PASO C: Llenamos las opciones de los selectores
      setDepartamentos(deps);
      setProvincias(provs);
      setDistritos(dists);

      // PASO D: Dejamos pre-seleccionados los valores del socio
      setSelectedDep(ubigeoInfo.departamento);
      setSelectedProv(ubigeoInfo.provincia);
      setSelectedUbigeo(ubigeoCode);

      // PASO E: Liberamos el bloqueo un instante después, para darle tiempo a React de renderizar
      //setTimeout(() => { isHydratingRef.current = false; }, 100);

    } catch (err) {
      if (!controller.signal.aborted) {
        toast.error('No se pudo cargar la ubicación predeterminada.');
      }
      isHydratingRef.current = false; // Liberar en caso de error
    } finally {
      if (!controller.signal.aborted) {
        setLoadingDep(false);
      }
    }
  }, []);

  // ─── Filtros combinados ───────────────────────────────────────────────────

  const sociosFiltrados = socios.filter((s) => {
    const matchTipo = filtroTipo === 'todos' || s.tipoSocio === filtroTipo;
    const term = search.toLowerCase();
    const matchSearch =
      s.nombreRazonSocial.toLowerCase().includes(term) ||
      s.numeroDocumento.includes(term) ||
      (s.emailFacturacion ?? '').toLowerCase().includes(term);
    return matchTipo && matchSearch;
  });

  // ─── Helpers de apertura del modal ────────────────────────────────────────

  const resetUbigeoSelectors = () => {
    setSelectedDep('');
    setSelectedProv('');
    setSelectedUbigeo('');
    setProvincias([]);
    setDistritos([]);
  };

  const openCreate = () => {
    resetUbigeoSelectors();
    setFormData({ ...EMPTY_FORM, usuarioId: currentUserId ?? 0 });
    setIsOpen(true);
  };

  const openEdit = (s: SocioNegocio) => {
    resetUbigeoSelectors();
    setFormData({ ...s });
    setIsOpen(true);

    // Hidratar la cascada si el socio tiene ubigeo registrado
    if (s.ubigeo) {
      hydrateUbigeo(s.ubigeo);
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
      hydrateAbortRef.current?.abort();
    }
    setIsOpen(open);
  };

  // ─── Submit del formulario ────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    setSaving(true);
    try {
      await saveSocio(formData, currentUserId);
      toast.success(
        formData.id ? 'Socio actualizado con éxito.' : 'Socio registrado con éxito.'
      );
      setIsOpen(false);
      await cargarDatos();
    } catch {
      toast.error('Ocurrió un error al intentar guardar.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Eliminación con ConfirmDialog ────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSocio(deleteTarget.id);
      toast.success('Socio eliminado correctamente.');
      await cargarDatos();
    } catch {
      toast.error('No se pudo eliminar. Puede estar referenciado en algún comprobante.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // ─── Helper de actualización de campos del formulario ────────────────────

  const set = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleTipoDocChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tipoDocumento: value,
      numeroDocumento: '',
      tipoPersona: inferirTipoPersona(value, ''),
    }));
  };

  const handleNumDocChange = (value: string) => {
    const soloNum = value.replace(/\D/g, '');
    setFormData((prev) => ({
      ...prev,
      numeroDocumento: soloNum,
      tipoPersona: inferirTipoPersona(prev.tipoDocumento, soloNum),
    }));
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className='animate-in fade-in-0 space-y-6 p-6'>

      {/* ── Encabezado ── */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-royal-blue flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <Building2 className='h-8 w-8' />
            Socios de Negocio
          </h1>
          <p className='mt-1 text-sm text-slate-500'>
            Gestiona tu cartera de clientes y proveedores
          </p>
        </div>
        <Button
          className='bg-vibrant-orange hover:bg-vibrant-orange/90 text-white'
          onClick={openCreate}
        >
          <Plus className='mr-2 h-4 w-4' />
          Nuevo Socio
        </Button>
      </div>

      {/* ── Barra de filtros ── */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <Input
            className='pl-9'
            placeholder='Buscar por nombre, documento o email...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className='flex gap-2'>
          {(['todos', 'C', 'P', 'A'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filtroTipo === t
                ? t === 'C'
                  ? 'border-blue-400 bg-blue-100 text-blue-700'
                  : t === 'P'
                    ? 'border-violet-400 bg-violet-100 text-violet-700'
                    : t === 'A'
                      ? 'border-orange-400 bg-orange-100 text-orange-700'
                      : 'border-slate-400 bg-slate-200 text-slate-700'
                : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
            >
              {t === 'todos'
                ? 'Todos'
                : t === 'C'
                  ? 'Clientes'
                  : t === 'P'
                    ? 'Proveedores'
                    : 'Ambos'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        <Table>
          <TableHeader className='bg-slate-50'>
            <TableRow>
              <TableHead className='font-semibold text-slate-700'>Nombre / Razón Social</TableHead>
              <TableHead className='font-semibold text-slate-700'>Tipo</TableHead>
              <TableHead className='font-semibold text-slate-700'>Documento</TableHead>
              <TableHead className='font-semibold text-slate-700'>Persona</TableHead>
              <TableHead className='font-semibold text-slate-700'>Teléfono</TableHead>
              <TableHead className='font-semibold text-slate-700'>Email Facturación</TableHead>
              <TableHead className='text-right font-semibold text-slate-700'>Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className='h-28 text-center text-slate-400'>
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Cargando socios...
                  </div>
                </TableCell>
              </TableRow>
            ) : sociosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className='h-28 text-center text-slate-400'>
                  {search || filtroTipo !== 'todos'
                    ? 'No se encontraron socios con ese criterio.'
                    : 'No hay socios registrados. Haz clic en "Nuevo Socio" para comenzar.'}
                </TableCell>
              </TableRow>
            ) : (
              sociosFiltrados.map((s) => (
                <TableRow key={s.id} className='transition-colors hover:bg-slate-50'>
                  <TableCell className='max-w-[200px] truncate font-medium text-slate-900'>
                    {s.nombreRazonSocial}
                  </TableCell>

                  <TableCell>
                    <TipoSocioBadge tipo={s.tipoSocio} />
                  </TableCell>

                  <TableCell>
                    <div className='flex flex-col'>
                      <span className='text-[10px] font-semibold uppercase text-slate-400'>
                        {labelTipoDoc(s.tipoDocumento)}
                      </span>
                      <span className='font-mono text-sm text-slate-700'>
                        {s.numeroDocumento}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${s.tipoPersona === 'Jurídica'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {s.tipoPersona ?? 'Natural'}
                    </span>
                  </TableCell>

                  <TableCell className='text-sm text-slate-600'>
                    {s.telefonoMovil || s.telefonoFijo || '—'}
                  </TableCell>

                  <TableCell className='max-w-[160px] truncate text-sm text-slate-500'>
                    {s.emailFacturacion || '—'}
                  </TableCell>

                  <TableCell className='text-right'>
                    <div className='flex justify-end gap-1'>
                      <Button
                        variant='outline'
                        size='icon'
                        title='Editar'
                        onClick={() => openEdit(s)}
                      >
                        <Edit className='h-4 w-4 text-slate-600' />
                      </Button>
                      <Button
                        variant='destructive'
                        size='icon'
                        title='Eliminar'
                        onClick={() =>
                          setDeleteTarget({ id: s.id!, nombre: s.nombreRazonSocial })
                        }
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
      {!loading && sociosFiltrados.length > 0 && (
        <p className='text-xs text-slate-400'>
          Mostrando{' '}
          <span className='font-medium text-slate-600'>{sociosFiltrados.length}</span>{' '}
          socio(s) —{' '}
          <span className='text-blue-600'>
            {socios.filter((s) => s.tipoSocio === 'C').length} Clientes
          </span>{' '}
          /{' '}
          <span className='text-violet-600'>
            {socios.filter((s) => s.tipoSocio === 'P').length} Proveedores
          </span>{' '}
          /{' '}
          <span className='text-orange-600'>
            {socios.filter((s) => s.tipoSocio === 'A').length} Ambos
          </span>
        </p>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          Modal Crear / Editar
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isOpen} onOpenChange={handleModalClose}>
        <DialogContent
          className='max-h-[90vh] overflow-y-auto sm:max-w-[700px]'
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-xl font-bold'>
              <Building2 className='text-royal-blue h-5 w-5' />
              {formData.id ? 'Editar Socio de Negocio' : 'Registrar Nuevo Socio de Negocio'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='mt-2 space-y-6'>

            {/* ════ Datos Principales ════ */}
            <div className='space-y-4'>
              <p className='text-xs font-semibold uppercase tracking-widest text-slate-400'>
                Datos Principales
              </p>

              {/* Tipo Socio */}
              <div className='space-y-1.5'>
                <Label htmlFor='tipoSocio'>
                  Tipo de Socio <span className='text-red-500'>*</span>
                </Label>
                <Select
                  value={formData.tipoSocio}
                  onValueChange={(v) => set('tipoSocio', v as 'C' | 'P' | 'A')}
                >
                  <SelectTrigger id='tipoSocio'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_SOCIO.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <TipoSocioBadge tipo={t.value} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nombre / Razón Social */}
              <div className='space-y-1.5'>
                <Label htmlFor='nombreRazonSocial'>
                  Nombre / Razón Social <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='nombreRazonSocial'
                  required
                  maxLength={255}
                  placeholder='Ej: Empresa SAC o García López, Juan'
                  value={formData.nombreRazonSocial}
                  onChange={(e) => set('nombreRazonSocial', e.target.value)}
                />
              </div>

              {/* Tipo Documento + Número */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-5'>
                <div className='space-y-1.5 sm:col-span-2'>
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
                          <span className='mr-1 font-mono text-xs font-bold text-slate-400'>
                            {t.value}
                          </span>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5 sm:col-span-3'>
                  <Label htmlFor='numeroDocumento'>
                    N° Documento <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='numeroDocumento'
                    required
                    inputMode='numeric'
                    maxLength={20}
                    placeholder={formData.tipoDocumento === '01' ? '8 dígitos' : '...'}
                    value={formData.numeroDocumento}
                    className='font-mono tracking-wider'
                    onChange={(e) => handleNumDocChange(e.target.value)}
                  />
                </div>
              </div>

              {/* Tipo Persona — inferido automáticamente del RUC */}
              {formData.tipoDocumento === '06' && (
                <div className='flex items-center gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2'>
                  <span className='text-xs text-amber-700'>
                    Tipo de persona inferido:{' '}
                    <strong>{formData.tipoPersona ?? 'Natural'}</strong>
                    {formData.tipoPersona === 'Jurídica'
                      ? ' — RUC inicia con 20 (empresa)'
                      : ' — RUC no inicia con 20 (persona natural con negocio)'}
                  </span>
                </div>
              )}
            </div>

            {/* ════ Ubicación (cascada Ubigeo) ════ */}
            <div className='space-y-4'>
              <p className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400'>
                <MapPin className='h-3.5 w-3.5' />
                Ubicación
              </p>

              {/* Dirección Fiscal */}
              <div className='space-y-1.5'>
                <Label htmlFor='direccionFiscal'>Dirección Fiscal</Label>
                <Input
                  id='direccionFiscal'
                  maxLength={255}
                  placeholder='Av. Principal 123, Lima'
                  value={formData.direccionFiscal ?? ''}
                  onChange={(e) => set('direccionFiscal', e.target.value || null)}
                />
              </div>

              {/* ── Cascada: Departamento → Provincia → Distrito ── */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>

                {/* Departamento */}
                <div className='space-y-1.5'>
                  <Label htmlFor='selectDepartamento'>Departamento</Label>
                  <Select
                    value={selectedDep}
                    onValueChange={handleDepartamentoChange}
                    disabled={loadingDep || departamentos.length === 0}
                  >
                    <SelectTrigger id='selectDepartamento'>
                      {loadingDep ? (
                        <span className='flex items-center gap-2 text-slate-400'>
                          <Loader2 className='h-3.5 w-3.5 animate-spin' />
                          Cargando...
                        </span>
                      ) : (
                        <SelectValue placeholder='Selecciona...' />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((dep) => (
                        <SelectItem key={dep} value={dep}>
                          {dep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Provincia */}
                <div className='space-y-1.5'>
                  <Label htmlFor='selectProvincia'>Provincia</Label>
                  <Select
                    value={selectedProv}
                    onValueChange={handleProvinciaChange}
                    disabled={!selectedDep || loadingProv || provincias.length === 0}
                  >
                    <SelectTrigger id='selectProvincia'>
                      {loadingProv ? (
                        <span className='flex items-center gap-2 text-slate-400'>
                          <Loader2 className='h-3.5 w-3.5 animate-spin' />
                          Cargando...
                        </span>
                      ) : (
                        <SelectValue placeholder={selectedDep ? 'Selecciona...' : '— primero elige departamento —'} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {provincias.map((prov) => (
                        <SelectItem key={prov} value={prov}>
                          {prov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Distrito (ubigeo) */}
                <div className='space-y-1.5'>
                  <Label htmlFor='selectDistrito'>Distrito</Label>
                  <Select
                    value={selectedUbigeo}
                    onValueChange={setSelectedUbigeo}
                    disabled={!selectedProv || loadingDist || distritos.length === 0}
                  >
                    <SelectTrigger id='selectDistrito'>
                      {loadingDist ? (
                        <span className='flex items-center gap-2 text-slate-400'>
                          <Loader2 className='h-3.5 w-3.5 animate-spin' />
                          Cargando...
                        </span>
                      ) : (
                        <SelectValue placeholder={selectedProv ? 'Selecciona...' : '— primero elige provincia —'} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {distritos.map((d) => (
                        <SelectItem key={d.ubigeo} value={d.ubigeo}>
                          {d.distrito}
                          <span className='ml-1.5 font-mono text-[10px] text-slate-400'>
                            {d.ubigeo}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Indicador visual del código ubigeo seleccionado */}
                  {formData.ubigeo && (
                    <p className='flex items-center gap-1 text-[11px] text-slate-500'>
                      <MapPin className='h-3 w-3 text-emerald-500' />
                      Ubigeo:{' '}
                      <span className='font-mono font-semibold text-emerald-600'>
                        {formData.ubigeo}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ════ Contacto ════ */}
            <div className='space-y-4'>
              <p className='text-xs font-semibold uppercase tracking-widest text-slate-400'>
                Contacto
              </p>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='space-y-1.5'>
                  <Label htmlFor='telefonoMovil'>Teléfono Móvil</Label>
                  <Input
                    id='telefonoMovil'
                    inputMode='tel'
                    maxLength={20}
                    placeholder='Ej: 987 654 321'
                    value={formData.telefonoMovil ?? ''}
                    onChange={(e) => set('telefonoMovil', e.target.value || null)}
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='telefonoFijo'>Teléfono Fijo</Label>
                  <Input
                    id='telefonoFijo'
                    inputMode='tel'
                    maxLength={20}
                    placeholder='Ej: 01 234 5678'
                    value={formData.telefonoFijo ?? ''}
                    onChange={(e) => set('telefonoFijo', e.target.value || null)}
                  />
                </div>

                <div className='space-y-1.5 sm:col-span-2'>
                  <Label htmlFor='emailFacturacion'>Email de Facturación</Label>
                  <Input
                    id='emailFacturacion'
                    type='email'
                    maxLength={150}
                    placeholder='facturacion@empresa.com'
                    value={formData.emailFacturacion ?? ''}
                    onChange={(e) => set('emailFacturacion', e.target.value || null)}
                  />
                </div>
              </div>
            </div>

            {/* ── Botón de envío ── */}
            <Button
              type='submit'
              disabled={saving}
              className='bg-royal-blue hover:bg-royal-blue/90 w-full text-white'
            >
              {saving ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Guardando...
                </span>
              ) : formData.id ? (
                'Guardar Cambios'
              ) : (
                'Registrar Socio de Negocio'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          ConfirmDialog — Confirmación de eliminación
      ══════════════════════════════════════════════════════════════════════ */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`¿Eliminar a "${deleteTarget?.nombre}"?`}
        desc='Esta acción no se puede deshacer. El socio de negocio será eliminado permanentemente.'
        confirmText={
          deleting ? (
            <span className='flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              Eliminando...
            </span>
          ) : (
            'Sí, eliminar'
          )
        }
        cancelBtnText='Cancelar'
        destructive
        isLoading={deleting}
        handleConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
