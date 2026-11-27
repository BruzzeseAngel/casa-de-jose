import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { DEMO, auth, db } from '../lib/firebase';
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);
// El contexto comparte la sesión y el perfil con las pantallas que necesitan autenticación.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null), [perfil, setPerfil] = useState(null), [admin, setAdmin] = useState(false), [loading, setLoading] = useState(!DEMO);
  useEffect(() => {
    if (DEMO)
      return;
    // El rol administrativo se obtiene de custom claims; jamás de localStorage.
    const stop = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        setPerfil(null);
        setAdmin(false);
        if (u) {
          const [token, snap] = await Promise.all([u.getIdTokenResult(true), getDoc(doc(db, 'usuarios', u.uid))]);
          setAdmin(token.claims.admin === true);
          if (snap.exists())
            setPerfil(snap.data());
        }
      }
      catch (e) {
        console.error('No se pudo cargar el perfil', e);
      }
      finally {
        setLoading(false);
      }
    });
    return stop;
  }, []);
  const logout = () => DEMO ? Promise.resolve() : signOut(auth);
  return <AuthCtx.Provider value={{ user, perfil, admin, loading, logout }}>{children}</AuthCtx.Provider>;
}
