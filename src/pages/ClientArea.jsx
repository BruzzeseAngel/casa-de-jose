import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { AUTH_COPY } from '../lib/authCopy';

// Los datos de solicitudes NO se leen aún. La integración segura con Firestore
// será una etapa independiente, con reglas basadas en request.auth.uid.
export default function ClientArea() {
  const { user, logout } = useAuth();
  const { lang } = useLanguage();
  const c = AUTH_COPY[lang] ?? AUTH_COPY.es;
  return <div className="container section narrow"><div className="form-panel client-panel">
    <p className="overline">LA CASA DE JOSÉ</p>
    <h1>{c.myArea}</h1>
    <p>{user.displayName || user.email}</p>
    <p className="notice soft" role="status">{c.placeholder}</p>
    <div className="client-actions">
      <Link className="btn secondary" to="/solicitudes-demo">{c.sampleLink}</Link>
      <button className="btn secondary" type="button" onClick={() => logout().catch(() => {})}>{c.logout}</button>
    </div>
    <p className="muted small">{c.privacy}</p>
  </div></div>;
}
