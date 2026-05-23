import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export function ProgressWidget() {
  const { user } = useAuth()
  const [pasoRuc, setPasoRuc] = useState(false)
  const [pasoTipoEmpresa, setPasoTipoEmpresa] = useState(false)
  const [pasoComprobantes, setPasoComprobantes] = useState(false)

  const tasks = [
    { id: "ruc", label: "RUC Registrado", state: pasoRuc, toggle: () => setPasoRuc(!pasoRuc) },
    { id: "tipo", label: "Tipo de Empresa Seleccionado", state: pasoTipoEmpresa, toggle: () => setPasoTipoEmpresa(!pasoTipoEmpresa) },
    { id: "comprobantes", label: "Documentos Presentados", state: pasoComprobantes, toggle: () => setPasoComprobantes(!pasoComprobantes) },
  ]

  const completedCount = [pasoRuc, pasoTipoEmpresa, pasoComprobantes].filter(Boolean).length
  const progressPercentage = Math.round((completedCount / tasks.length) * 100)

  return (
    <Card className="shadow-lg border-0 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-foreground">
          Progreso de Formalización
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={task.toggle}
            >
              {task.state ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-success-green" />
              ) : (
                <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
              )}
              <span className={`text-sm ${task.state ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {task.label}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-2 pt-2">
          <Progress value={progressPercentage} className="h-2.5 bg-muted [&>div]:bg-success-green transition-all duration-500 ease-in-out" />
          <div className="space-y-1">
            <p className="text-center text-sm font-semibold text-success-green">
              {progressPercentage}% Completado
            </p>
            {user ? (
              <p className="text-center text-xs font-medium text-success-green">
                Progreso sincronizado en la nube ☁️
              </p>
            ) : (
              <p className="text-center text-xs text-muted-foreground">
                Progreso local. Inicia sesión para guardar tus avances.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
