import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onIdTokenChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth necesita AuthProvider');
  return value;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(Boolean(auth));
  const [error, setError] = useState(null);
  const control = useRef(0);

  useEffect(() => {
    if (!auth) return undefined;
    let mounted = true;
    const unsubscribe = onIdTokenChanged(auth, async usuario => {
      const version = ++control.current;
      setLoading(true);
      setAdmin(false);
      setError(null);
      setUser(usuario);
      try {
        if (usuario) {
          // Custom claim emitida por Firebase Admin SDK. No confiar en roles de localStorage.
          const token = await usuario.getIdTokenResult();
          if (mounted && version === control.current) setAdmin(token.claims.admin === true);
        }
      } catch (err) {
        console.error('No se pudo verificar el rol administrativo:', err);
        if (mounted && version === control.current) setError('auth');
      } finally {
        if (mounted && version === control.current) setLoading(false);
      }
    }, err => {
      if (mounted) { setUser(null); setAdmin(false); setError('auth'); setLoading(false); }
    });
    return () => { mounted = false; ++control.current; unsubscribe(); };
  }, []);

  async function logout() {
    if (auth) await signOut(auth);
  }
  return <AuthContext.Provider value={{ user, admin, loading, error, logout }}>
    {children}
  </AuthContext.Provider>;
}
