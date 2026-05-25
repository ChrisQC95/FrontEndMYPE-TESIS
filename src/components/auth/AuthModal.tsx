import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, ArrowLeft } from "lucide-react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, User, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const { resetPassword, setDbUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Limpiar el estado al cerrar el modal
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setShowForgotPassword(false);
        setResetSent(false);
        setEmail("");
        setPassword("");
        setActiveTab(defaultTab);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultTab]);

  const syncUserWithBackend = async (firebaseUser: User) => {
    try {
      const token = await firebaseUser.getIdToken();
      //const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios`, {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          // Si el usuario se registra con correo, Firebase no tiene nombre inicialmente,
          // por lo que enviamos un string vacío o lo que venga de Firebase.
          nombre: firebaseUser.displayName || ""
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo sincronizar el usuario con la base de datos local.");
      }

      const userData = await response.json();
      console.log("Usuario sincronizado en PostgreSQL:", userData);
      return userData;
    } catch (error) {
      console.error("Error en sincronización Backend:", error);
      throw error;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Firebase lo intenta
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      try {
        // 2. El backend lo intenta
        const userData = await syncUserWithBackend(userCredential.user);
        setDbUser(userData);
        toast.success("Sesión iniciada correctamente");
        onClose();
      } catch (backendError) {
        // 3. ¡NUEVO! Si el backend falla, cancelamos la sesión en Firebase
        await signOut(auth);
        throw new Error("No se pudo conectar con el servidor. Intenta de nuevo.");
      }

    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userData = await syncUserWithBackend(userCredential.user);
      setDbUser(userData);
      toast.success("Cuenta creada correctamente");
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Error al crear cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Por favor ingresa tu correo electrónico.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      toast.success("Correo de recuperación enviado.");
    } catch (error: any) {
      toast.error(error.message || "Error al enviar el correo de recuperación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        {showForgotPassword ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-royal-blue text-center text-2xl font-semibold mt-2">
                Recuperar Contraseña
              </DialogTitle>
              <DialogDescription className="text-center">
                Ingresa tu correo electrónico para recibir un enlace de recuperación.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              {resetSent ? (
                <div className="space-y-4 fade-in-0 animate-in p-1">
                  <Alert className="bg-green-50 border-green-200">
                    <Info className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">¡Correo Enviado!</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Revisa tu bandeja de entrada o spam para restablecer tu contraseña.
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4 fade-in-0 animate-in">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Correo Electrónico</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      required
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-semibold mt-2"
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Enviar Enlace"}
                  </Button>
                </form>
              )}

              <Button
                variant="ghost"
                className="w-full flex items-center justify-center gap-2 text-muted-foreground mt-2 hover:bg-transparent hover:text-foreground"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetSent(false);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-royal-blue text-center text-2xl font-semibold mt-2">
                {activeTab === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
              </DialogTitle>
              <DialogDescription className="text-center">
                {activeTab === "login"
                  ? "Ingresa tus credenciales para acceder a tu panel."
                  : "Regístrate para empezar a usar nuestros servicios."}
              </DialogDescription>
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val as "login" | "register")}
              className="w-full mt-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Correo Electrónico</Label>
                    <Input
                      id="login-email"
                      type="email"
                      required
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-royal-blue hover:underline font-medium focus:outline-none"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-vibrant-orange hover:bg-vibrant-orange/90 text-white font-semibold mt-2"
                    disabled={loading}
                  >
                    {loading ? "Iniciando..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo Electrónico</Label>
                    <Input
                      id="register-email"
                      type="email"
                      required
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-royal-blue hover:bg-royal-blue/90 text-white font-semibold mt-2"
                    disabled={loading}
                  >
                    {loading ? "Creando cuenta..." : "Registrarse"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
