import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEMO } from '../lib/firebase';
// Protege la navegación; las reglas de Firebase y Cloud Functions aplican la autorización real.
export default function ProtectedRoute({ children, soloAdmin = false }) {
  const { loading, user, admin } = useAuth();
  const location = useLocation();
  if (loading)
    return <section className="container section">
      <p>Cargando perfil...</p>
    </section>;
  if (DEMO || !user)
    return <Navigate to="/acceso" state={{ from: location.pathname }} replace />;
  if (soloAdmin && !admin)
    return <Navigate to="/mis-solicitudes" replace />;
  return children;
}
