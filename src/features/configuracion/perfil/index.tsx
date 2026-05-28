import { useEffect, useRef, useState } from 'react';
import { Loader2, Save, Store, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

import { getEmpresaPerfil, saveEmpresaPerfil, uploadImageFile } from './api';
import type { EmpresaPerfilDTO } from './types';

export default function PerfilEmpresa() {
  const { dbUser, setEmpresaPerfil } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<EmpresaPerfilDTO>({
    usuarioId: 0,
    ruc: '',
    razonSocial: '',
    nombreComercial: '',
    direccionFiscal: '',
    telefono: '',
    emailContacto: '',
    logoUrl: '',
  });

  useEffect(() => {
    if (!dbUser?.id) return;
    
    // Cargar perfil desde el backend
    getEmpresaPerfil(dbUser.id)
      .then((data) => {
        setForm(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Error al cargar el perfil de empresa');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [dbUser?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingLogo(true);
      try {
        const uploadedUrl = await uploadImageFile(file);
        setForm((prev) => ({ ...prev, logoUrl: uploadedUrl }));
        toast.success('Imagen subida correctamente');
      } catch (err) {
        console.error(err);
        toast.error('Error al subir la imagen');
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUser?.id) return;

    setSaving(true);
    try {
      const updated = await saveEmpresaPerfil({ ...form, usuarioId: dbUser.id });
      setEmpresaPerfil(updated); // Actualiza el context/sidebar instantáneamente
      toast.success('Perfil actualizado correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Ocurrió un error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='grid grid-cols-1 gap-6 md:grid-cols-3'>
      {/* Columna Izquierda: Logo */}
      <div className='space-y-6 md:col-span-1'>
        <Card>
          <CardHeader>
            <CardTitle>Logo de la Empresa</CardTitle>
            <CardDescription>Sube un logotipo para tu empresa</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center space-y-4'>
            <div className='flex aspect-square w-48 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted'>
              {uploadingLogo ? (
                <div className='flex flex-col items-center text-muted-foreground'>
                  <Loader2 className='mb-2 h-8 w-8 animate-spin' />
                  <span className='text-xs'>Subiendo...</span>
                </div>
              ) : form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt='Logo preview'
                  className='h-full w-full object-cover'
                />
              ) : (
                <Store className='h-16 w-16 text-muted-foreground opacity-50' />
              )}
            </div>
            
            <input
              type='file'
              accept='image/*'
              className='hidden'
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <Button
              type='button'
              variant='outline'
              onClick={() => fileInputRef.current?.click()}
              className='w-full'
              disabled={uploadingLogo}
            >
              {uploadingLogo ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                <UploadCloud className='mr-2 h-4 w-4' />
              )}
              {uploadingLogo ? 'Subiendo...' : 'Cambiar Imagen'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Columna Derecha: Datos */}
      <div className='space-y-6 md:col-span-2'>
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>
              Actualiza los datos de facturación y contacto de tu negocio.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='ruc'>RUC</Label>
                <Input
                  id='ruc'
                  name='ruc'
                  placeholder='Ej. 20123456789'
                  value={form.ruc || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='razonSocial'>Razón Social</Label>
                <Input
                  id='razonSocial'
                  name='razonSocial'
                  placeholder='Mi Empresa S.A.C.'
                  value={form.razonSocial || ''}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='nombreComercial'>Nombre Comercial</Label>
                <Input
                  id='nombreComercial'
                  name='nombreComercial'
                  placeholder='Mi Tienda'
                  value={form.nombreComercial || ''}
                  onChange={handleChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='direccionFiscal'>Dirección Fiscal</Label>
                <Input
                  id='direccionFiscal'
                  name='direccionFiscal'
                  placeholder='Av. Principal 123'
                  value={form.direccionFiscal || ''}
                  onChange={handleChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='telefono'>Teléfono</Label>
                <Input
                  id='telefono'
                  name='telefono'
                  placeholder='987654321'
                  value={form.telefono || ''}
                  onChange={handleChange}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='emailContacto'>Email de Contacto</Label>
                <Input
                  id='emailContacto'
                  name='emailContacto'
                  type='email'
                  placeholder='contacto@miempresa.com'
                  value={form.emailContacto || ''}
                  onChange={handleChange}
                />
              </div>
              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='emailAcceso' className='text-muted-foreground'>Email de Acceso (No editable)</Label>
                <Input
                  id='emailAcceso'
                  type='email'
                  value={dbUser?.email || ''}
                  disabled
                  className='cursor-not-allowed bg-muted text-muted-foreground'
                />
              </div>
            </div>

            <div className='flex justify-end pt-4'>
              <Button type='submit' disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className='mr-2 h-4 w-4' />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
