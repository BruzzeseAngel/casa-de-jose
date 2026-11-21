import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { DEMO_REQUEST_COPY } from '../lib/demoRequestCopy';

// Presentación del futuro acceso: NO solicita contraseñas ni simula seguridad.
export default function Access() {
  const { lang } = useLanguage();
  const copy = DEMO_REQUEST_COPY[lang] ?? DEMO_REQUEST_COPY.es;
  return (
    <section className="auth-backdrop">
      <div className="auth-panel">
        <p className="overline">LA CASA DE JOSÉ</p>
        <h1>{copy.access}</h1>
        <p className="muted">{copy.accessDescription}</p>
        <p className="notice warning" role="note">{copy.noLogin}</p>
        <Link className="btn primary block" to="/mis-solicitudes">{copy.enter}</Link>
        <p className="muted small">{copy.privacy}</p>
      </div>
    </section>
  );
}
