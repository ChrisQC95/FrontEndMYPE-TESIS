import { useCallback, useEffect, useState } from 'react';

import { Landmark, Edit, Loader2, Plus, Trash2 } from 'lucide-react';
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

import { deleteCuenta, getCuentas, saveCuenta } from './api';
import type { CuentaBancaria } from './types';

const BANCOS = [
  'BCP',
  'BBVA',
  'Interbank',
  'Scotiabank',
  'BanBif',
  'Banco de la Nación',
  'Yape',
  'Plin',
  'Otro',
];

const MONEDAS = ['SOLES', 'DÓLARES'];

const EMPTY_FORM: Omit<CuentaBancaria, 'id'> = {
  usuarioId: 0,
  banco: '',
  moneda: 'SOLES',
  numeroCuenta: '',
  cci: '',
  activo: true,
};

export default function CuentasBancariasPage() {
  const { dbUser } = useAuth();
  const currentUserId = dbUser?.id;

  const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<CuentaBancaria, 'id'> & { id?: number }>(
    EMPTY_FORM
  );

  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    banco: string;
    numeroCuenta: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getCuentas(currentUserId);
      setCuentas(data);
    } catch {
      toast.error('Error al cargar las cuentas bancarias.');
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const openCreate = () => {
    setFormData({ ...EMPTY_FORM, usuarioId: currentUserId ?? 0 });
    setIsOpen(true);
  };

  const openEdit = (c: CuentaBancaria) => {
    setFormData({ ...c });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    setSaving(true);
    try {
      await saveCuenta(formData, currentUserId);
      toast.success(
        formData.id ? 'Cuenta actualizada con éxito.' : 'Cuenta registrada con éxito.'
      );
      setIsOpen(false);
      await cargarDatos();
    } catch {
      toast.error('Ocurrió un error al intentar guardar la cuenta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCuenta(deleteTarget.id);
      toast.success('Cuenta eliminada correctamente.');
      await cargarDatos();
    } catch {
      toast.error('No se pudo eliminar la cuenta.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const set = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  return (
    <div className='animate-in fade-in-0 space-y-6 p-6'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-royal-blue flex items-center gap-2 text-3xl font-bold tracking-tight'>
            <Landmark className='h-8 w-8' />
            Cuentas Bancarias
          </h1>
          <p className='mt-1 text-sm text-slate-500'>
            Configura las cuentas y métodos de pago de tu negocio
          </p>
        </div>
        <Button
          className='bg-vibrant-orange hover:bg-vibrant-orange/90 text-white'
          onClick={openCreate}
        >
          <Plus className='mr-2 h-4 w-4' />
          Nueva Cuenta
        </Button>
      </div>

      <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        <Table>
          <TableHeader className='bg-slate-50'>
            <TableRow>
              <TableHead className='font-semibold text-slate-700'>Banco</TableHead>
              <TableHead className='font-semibold text-slate-700'>Moneda</TableHead>
              <TableHead className='font-semibold text-slate-700'>N° de Cuenta</TableHead>
              <TableHead className='font-semibold text-slate-700'>CCI</TableHead>
              <TableHead className='font-semibold text-slate-700'>Estado</TableHead>
              <TableHead className='text-right font-semibold text-slate-700'>Opciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className='h-28 text-center text-slate-400'>
                  <div className='flex items-center justify-center gap-2'>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    Cargando cuentas...
                  </div>
                </TableCell>
              </TableRow>
            ) : cuentas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-28 text-center text-slate-400'>
                  No hay cuentas registradas. Haz clic en "Nueva Cuenta" para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              cuentas.map((c) => (
                <TableRow key={c.id} className='transition-colors hover:bg-slate-50'>
                  <TableCell className='font-medium text-slate-900'>
                    {c.banco}
                  </TableCell>
                  <TableCell>
                    {c.moneda}
                  </TableCell>
                  <TableCell className='font-mono text-sm text-slate-700'>
                    {c.numeroCuenta || '—'}
                  </TableCell>
                  <TableCell className='font-mono text-sm text-slate-700'>
                    {c.cci || '—'}
                  </TableCell>
                  <TableCell>
                    {c.activo ? (
                      <Badge className='border-blue-200 bg-blue-50 text-blue-700'>
                        CUENTA PRINCIPAL
                      </Badge>
                    ) : (
                      <Badge className='border-slate-200 bg-slate-100 text-slate-500' variant='outline'>
                        SECUNDARIA
                      </Badge>
                    )}
                  </TableCell>
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
                        onClick={() =>
                          setDeleteTarget({ id: c.id!, banco: c.banco, numeroCuenta: c.numeroCuenta })
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className='sm:max-w-[500px]'
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-xl font-bold'>
              <Landmark className='text-royal-blue h-5 w-5' />
              {formData.id ? 'Editar Cuenta Bancaria' : 'Registrar Nueva Cuenta'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className='mt-2 space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <Label htmlFor='banco'>
                  Banco <span className='text-red-500'>*</span>
                </Label>
                <Select
                  value={formData.banco}
                  onValueChange={(v) => set('banco', v)}
                  required
                >
                  <SelectTrigger id='banco'>
                    <SelectValue placeholder='Seleccione...' />
                  </SelectTrigger>
                  <SelectContent>
                    {BANCOS.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='moneda'>
                  Moneda <span className='text-red-500'>*</span>
                </Label>
                <Select
                  value={formData.moneda}
                  onValueChange={(v) => set('moneda', v)}
                  required
                >
                  <SelectTrigger id='moneda'>
                    <SelectValue placeholder='Seleccione...' />
                  </SelectTrigger>
                  <SelectContent>
                    {MONEDAS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='numeroCuenta'>Número de Cuenta</Label>
              <Input
                id='numeroCuenta'
                placeholder='Ej: 191-12345678-0-12'
                value={formData.numeroCuenta}
                onChange={(e) => set('numeroCuenta', e.target.value)}
                className='font-mono'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='cci'>CCI (Código de Cuenta Interbancario)</Label>
              <Input
                id='cci'
                placeholder='Ej: 00219112345678012345'
                value={formData.cci}
                onChange={(e) => set('cci', e.target.value)}
                className='font-mono'
              />
            </div>

            <div className='flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm'>
              <div className='space-y-0.5'>
                <Label className='text-base'>Cuenta Principal (Activa)</Label>
                <p className='text-xs text-muted-foreground'>
                  Si marcas esta cuenta como principal, las demás pasarán automáticamente a secundarias.
                </p>
              </div>
              <Switch
                checked={formData.activo}
                onCheckedChange={(checked) => set('activo', checked)}
              />
            </div>

            <div className='flex justify-end gap-2 pt-4'>
              <Button type='button' variant='outline' onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type='submit' disabled={saving}>
                {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {saving ? 'Guardando...' : 'Guardar Cuenta'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title='¿Eliminar cuenta bancaria?'
        desc={`Estás a punto de eliminar la cuenta ${deleteTarget?.banco} ${deleteTarget?.numeroCuenta ? `(${deleteTarget.numeroCuenta})` : ''}. Esta acción no se puede deshacer.`}
        confirmText='Eliminar'
        cancelBtnText='Cancelar'
        destructive={true}
        handleConfirm={handleDeleteConfirm}
        isLoading={deleting}
      />
    </div>
  );
}
