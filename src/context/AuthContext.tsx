import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface DbUser {
  id: number;
  firebaseUid: string;
  email: string;
  ruc?: string;
  razonSocial?: string;
}
interface AuthContextType {
  user: User | null;
  dbUser: DbUser | null;
  setDbUser: (user: DbUser | null) => void;
  loading: boolean;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  saveTempData: (key: string, data: any) => void;
  getTempData: (key: string) => any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // AQUÍ SE MAPEA TU IDEA: Buscamos el ID numérico en la base de datos
        try {
          // Antes: const response = await fetch(`http://localhost:8080/api/usuarios/firebase/${currentUser.uid}`);

          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/usuarios/firebase/${currentUser.uid}`);
          if (response.ok) {
            const data = await response.json();
            setDbUser(data); // Guardamos el usuario de BD globalmente
          } else {
            console.warn("Usuario autenticado en Firebase, pero no existe en PostgreSQL");
          }
        } catch (error) {
          console.error("Error al conectar con Spring Boot:", error);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);

      // Si el usuario inicia sesión y hay datos temporales almacenados,
      // aquí se podría implementar la lógica para migrar de localStorage a Firestore o al Backend.
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: 'http://localhost:5173/reset-password',
        handleCodeInApp: false, // para password reset normal suele ser false 
      };
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
    } catch (error) {
      console.error("Error al enviar correo de recuperación:", error);
      throw error;
    }
  };

  // Base para guardar datos temporales cuando no hay sesión iniciada
  const saveTempData = (key: string, data: any) => {
    // Solo guardamos temporalmente si no hay usuario autenticado
    if (!user) {
      localStorage.setItem(`erp_temp_${key}`, JSON.stringify(data));
    } else {
      // Opcional: manejar envío a BD directo
      console.log("Usuario autenticado: considerar guardar en BD -> key:", key);
    }
  };

  const getTempData = (key: string) => {
    const item = localStorage.getItem(`erp_temp_${key}`);
    try {
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, dbUser, setDbUser, loading, signOut, resetPassword, saveTempData, getTempData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
