import { Navigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { AUTH_ENABLED, DEMO } from '../lib/firebase';

// Esta protección mejora la navegación. La autorización real de datos requerirá
// reglas de Firestore y validación en el servidor en una etapa posterior.
export default function ProtectedRoute({ children }) {
  const { user, loading, error } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  if (DEMO) return <Navigate to="/solicitudes-demo" replace />;
  if (!AUTH_ENABLED) return <Navigate to="/acceso" replace />;
  if (loading) return <div className="container section"><p role="status">{t('loading')}</p></div>;
  if (error) return <div className="container section"><p role="alert" className="notice error">No se pudo comprobar la sesión. Recarga la página.</p></div>;
  if (!user) return <Navigate to="/acceso" state={{ from: location.pathname }} replace />;
  return children;
}
