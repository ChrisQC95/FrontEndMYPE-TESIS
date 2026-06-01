import { useEffect, useState, useMemo } from "react";
import { Categoria } from "./types";
import { getCategorias, saveCategoria, deleteCategoria } from "./api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, Tags, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CategoriasPage() {
  const { dbUser } = useAuth();
  const currentUserId = dbUser?.id;
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Categoria>({ nombre: "", descripcion: "", usuarioId: currentUserId || 0 });
  const [searchTerm, setSearchTerm] = useState("");

  const cargarDatos = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getCategorias(currentUserId);
      setCategorias(data);
    } catch (error) {
      toast.error("Error al cargar las categorías desde el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    try {
      await saveCategoria(formData, currentUserId);
      toast.success(formData.id ? "Categoría actualizada con éxito" : "Categoría creada con éxito");
      setIsOpen(false);
      cargarDatos();
      setFormData({ nombre: "", descripcion: "", usuarioId: 0 });
    } catch (error) {
      toast.error("Ocurrió un error al intentar guardar.");
    }
  };

  const handleEdit = (cat: Categoria) => {
    setFormData(cat);
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.")) {
      try {
        await deleteCategoria(id);
        toast.success("Categoría eliminada permanentemente.");
        cargarDatos();
      } catch (error) {
        toast.error("Error al eliminar. Revisa si está siendo usada por algún producto.");
      }
    }
  };

  const openCreate = () => {
    setFormData({ nombre: "", descripcion: "", usuarioId: currentUserId || 1 });
    setIsOpen(true);
  };

  // Filtrado local en memoria
  const filteredCategorias = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return categorias;
    return categorias.filter(
      (cat) =>
        cat.nombre.toLowerCase().includes(q) ||
        (cat.descripcion && cat.descripcion.toLowerCase().includes(q))
    );
  }, [categorias, searchTerm]);

  return (
    <div className="p-6 space-y-6 fade-in-0 animate-in">
      
      {/* ── Encabezado ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-royal-blue flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Tags className="h-8 w-8" />
            Categorías
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona la clasificación de tus productos y servicios
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-white shadow-sm"
              onClick={openCreate}
            >
              <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <Tags className="h-5 w-5 text-royal-blue" />
                {formData.id ? "Editar Categoría" : "Registrar Nueva Categoría"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">
                  Nombre de la Categoría <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="Ej: Laptops, Abarrotes, Servicios Web..."
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Descripción (Opcional)</label>
                <Input
                  placeholder="Breve detalle de la categoría"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-royal-blue hover:bg-royal-blue/90 text-white shadow-sm h-11 font-bold">
                {formData.id ? "Guardar Cambios" : "Registrar Categoría"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Barra de filtros ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="pl-9 bg-white border-slate-200"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700 h-11 w-[35%]">Nombre</TableHead>
              <TableHead className="font-semibold text-slate-700 h-11 w-[35%]">Descripción</TableHead>
              <TableHead className="font-semibold text-slate-700 h-11 text-center w-[15%]">Estado</TableHead>
              <TableHead className="text-right font-semibold text-slate-700 h-11 w-[15%]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cargando categorías...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCategorias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-slate-400">
                  {searchTerm 
                    ? "No se encontraron categorías con ese criterio." 
                    : "No hay categorías registradas. Haz clic en 'Nueva Categoría' para empezar."}
                </TableCell>
              </TableRow>
            ) : (
              filteredCategorias.map((cat) => (
                <TableRow key={cat.id} className="transition-colors hover:bg-slate-50 border-b-slate-100 last:border-0">
                  <TableCell className="font-medium text-slate-900">{cat.nombre}</TableCell>
                  <TableCell className="text-slate-600 truncate max-w-[200px]">{cat.descripcion || "—"}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none pointer-events-none">Activo</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(cat)} title="Editar">
                        <Edit className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(cat.id!)} title="Eliminar">
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
      {!loading && filteredCategorias.length > 0 && (
        <p className="text-xs text-slate-400">
          Mostrando <span className="font-medium text-slate-600">{filteredCategorias.length}</span> categoría(s)
        </p>
      )}

    </div>
  );
}