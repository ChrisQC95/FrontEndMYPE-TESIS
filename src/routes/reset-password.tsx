import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordComponent,
})

function ResetPasswordComponent() {
  const navigate = useNavigate()
  const [oobCode, setOobCode] = useState<string | null>(null)
  const [emailToReset, setEmailToReset] = useState<string | null>(null)
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [isVerifying, setIsVerifying] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Firebase auth manda el código en la URL como ?oobCode=XXXXX
    const searchParams = new URLSearchParams(window.location.search)
    const code = searchParams.get('oobCode')
    
    if (!code) {
      setErrorCode("no-code")
      setIsVerifying(false)
      return
    }
    
    setOobCode(code)
    
    // Verificar si el oobCode es válido al montar el componente
    verifyPasswordResetCode(auth, code)
      .then((email) => {
        setEmailToReset(email)
        setIsVerifying(false)
      })
      .catch((err) => {
        console.error("Error validando el código de recuperación:", err)
        setErrorCode(err.code || "invalid-code")
        setIsVerifying(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }
    
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }
    
    if (!oobCode) return

    setIsSubmitting(true)
    
    try {
      await confirmPasswordReset(auth, oobCode, password)
      setSuccess(true)
      toast.success("Contraseña actualizada exitosamente")
    } catch (err: any) {
      console.error("Error al actualizar contraseña:", err)
      toast.error(err.message || "Hubo un error al actualizar la contraseña")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center text-royal-blue">
            Restablecer Contraseña
          </CardTitle>
          <CardDescription className="text-center">
            {isVerifying ? "Verificando el enlace de recuperación..." :
             success ? "Operación exitosa" :
             emailToReset ? `Ingresa una nueva contraseña para ${emailToReset}` : 
             "Enlace inválido o expirado"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
              <p className="text-sm text-muted-foreground">Comprobando token de seguridad...</p>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">¡Contraseña Cambiada!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Tu contraseña ha sido restablecida de manera segura. Ya puedes volver al panel principal para acceder a tu cuenta.
                </AlertDescription>
              </Alert>
              <Button 
                className="w-full bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-semibold" 
                onClick={() => navigate({ to: '/' })}
              >
                Volver al Inicio
              </Button>
            </div>
          ) : errorCode ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertTitle>Enlace no válido</AlertTitle>
                <AlertDescription>
                  {errorCode === 'no-code' 
                    ? "No se proporcionó un código de recuperación en el enlace." 
                    : "El código de recuperación ha expirado, ya fue utilizado o es incorrecto. Por favor, solicita un nuevo enlace."}
                </AlertDescription>
              </Alert>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate({ to: '/' })}
              >
                Volver al Inicio
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 fade-in-0 animate-in">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  required
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-royal-blue hover:bg-royal-blue/90 text-white font-semibold mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                  </>
                ) : "Guardar Nueva Contraseña"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
