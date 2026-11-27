import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { obtenerMisSolicitudes } from '../lib/data';
import { formatoCLP } from '../lib/quote.mjs';
const ts = s => s?.toDate ? s.toDate().toLocaleDateString('es-CL') : String(s || '—');
// Consulta las solicitudes asociadas al UID autenticado y muestra sus estados registrados.
export default function MyRequests() {
  const { user } = useAuth(), { t } = useLanguage(), [solicitudes, setSolicitudes] = useState([]), [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    if (!user)
      return;
    obtenerMisSolicitudes(user.uid).then(rows => {
      if (active)
        setSolicitudes(rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }).catch(e => {
      if (active)
        setError(e.message);
    });
    return () => {
      active = false;
    };
  }, [user]);
  return <div className="container section">
    <div className="page-title">
      <p className="overline">LA CASA DE JOSÉ</p>
      <h1>{t('myRequestsTitle')}</h1>
      <p>{t('myRequestsSub')}</p>
    </div>
    {error && <p role="alert" className="notice error">{error}</p>}
    {solicitudes.length === 0 && !error ? <div className="form-panel empty-state">
      <span className="huge-icon">◇</span>
      <p>{t('noRequests')}</p>
    </div> : <div className="requests-grid">
      {solicitudes.map(s => <article className="request-card" key={s.id}>
        <div className="between">
          <span className="overline">SOLICITUD {s.id.slice(0, 8)}</span>
          <span className={`status ${s.estado?.toLowerCase()}`}>
            {t('status' + ({ Pendiente: 'Pending', Confirmada: 'Confirmed', Rechazada: 'Rejected', Archivada: 'Archived' }[s.estado] || 'Pending'))}
          </span>
        </div>
        <h2>{ts(s.fechaEntrada)} — {ts(s.fechaSalida)}</h2>
        <p>
          {s.detalleHabitaciones?.map(d => `${d.cantidad} × ${d.nombre || d.habitacionId}`).join(' · ')}
        </p>
        <div className="between">
          <small>{t('total')}</small>
          <strong className="price">{formatoCLP(s.totalCotizado)}</strong>
        </div>
        {s.comentarios && <p className="request-client-comments"><strong>{t('commentsOptional')}:</strong> {s.comentarios}</p>}
        <p className="notice soft small">{t('availability')}</p>
      </article>)}
    </div>}
  </div>;
}
