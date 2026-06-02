import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

const PASOS = [
  "RUC Registrado",
  "Tipo de Empresa Seleccionado",
  "Documentos Presentados",
]

export function ProgressWidget() {
  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="pb-3 pt-4 px-5">
        <CardTitle className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
          Progreso de Formalización
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-4">
        <ul className="space-y-2.5">
          {PASOS.map((label) => (
            <li key={label} className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
