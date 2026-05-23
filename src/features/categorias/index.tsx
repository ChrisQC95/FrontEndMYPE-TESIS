import { useEffect, useState } from "react";
import { Categoria } from "./types";
import { getCategorias, saveCategoria, deleteCategoria } from "./api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CategoriasPage() {
  const { dbUser } = useAuth();
  const currentUserId = dbUser?.id;
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Categoria>({ nombre: "", descripcion: "", usuarioId: currentUserId || 0 });

  const cargarDatos = async () => {
    if (!currentUserId) {
      setLoading(false);
      return
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
    // Alerta nativa simple para confirmación rápida
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

  return (
    <div className="p-6 space-y-6 fade-in-0 animate-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-royal-blue">Catálogo de Categorías</h1>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-vibrant-orange hover:bg-vibrant-orange/90 text-white"
              onClick={() => setFormData({ nombre: "", descripcion: "", usuarioId: 1 })}
            >
              <Plus className="mr-2 h-4 w-4" /> Nueva Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{formData.id ? "Editar Categoría" : "Crear Nueva Categoría"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Nombre de la Categoría</label>
                <Input
                  required
                  placeholder="Ej: Laptops, Abarrotes, Servicios Web..."
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Descripción (Opcional)</label>
                <Input
                  placeholder="Breve detalle de la categoría"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full bg-royal-blue hover:bg-royal-blue/90 text-white mt-4">
                {formData.id ? "Guardar Cambios" : "Registrar Categoría"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Descripción</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                  Cargando categorías...
                </TableCell>
              </TableRow>
            ) : categorias.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                  No hay categorías registradas. Haz clic en "Nueva Categoría" para empezar.
                </TableCell>
              </TableRow>
            ) : (
              categorias.map((cat) => (
                <TableRow key={cat.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{cat.nombre}</TableCell>
                  <TableCell className="text-slate-600">{cat.descripcion || "—"}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleEdit(cat)} title="Editar">
                      <Edit className="h-4 w-4 text-slate-600" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(cat.id!)} title="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}