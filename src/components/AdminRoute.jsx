import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO, AUTH_ENABLED } from '../lib/firebase';

export default function AdminRoute({ children }) {
  const { user, admin, loading, error } = useAuth();
  const location = useLocation();
  // En modo demo el panel es estrictamente de lectura y usa solo datos ficticios.
  if (DEMO) return children;
  if (!AUTH_ENABLED) return <div className="container section"><p className="notice error">Configura Firebase para administrar habitaciones.</p></div>;
  if (loading) return <div className="container section"><p role="status">Comprobando permisos de administrador…</p></div>;
  if (error) return <div className="container section"><p role="alert" className="notice error">No fue posible verificar los permisos. Vuelve a iniciar sesión.</p></div>;
  if (!user) return <Navigate to="/acceso" state={{ from: location.pathname }} replace />;
  if (!admin) return <div className="container section narrow"><h1>Acceso restringido</h1><p role="alert" className="notice error">Esta sección requiere una cuenta con permiso administrativo asignado mediante Firebase Auth (custom claim).</p></div>;
  return children;
}
