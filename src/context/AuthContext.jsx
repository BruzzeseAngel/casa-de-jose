import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext(null);
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth necesita AuthProvider');
  return value;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!auth) return undefined;
    const unsubscribe = onAuthStateChanged(auth,
      usuario => { setUser(usuario); setError(null); setLoading(false); },
      () => { setUser(null); setError('auth'); setLoading(false); },
    );
    return unsubscribe;
  }, []);

  async function logout() {
    if (auth) await signOut(auth);
  }
  return (
    <AuthContext.Provider value={{ user, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
