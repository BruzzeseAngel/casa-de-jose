import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { nombreHabitacion } from '../lib/contentTranslations';
import { DEMO_ROOMS } from '../lib/demo';
import { DEMO_REQUEST_COPY } from '../lib/demoRequestCopy';
import { eliminarSolicitudDemo, leerSolicitudesDemo } from '../lib/demoRequests.mjs';
import { formatoCLP, nochesEntre } from '../lib/quote.mjs';

function cargar() {
  try { return { solicitudes: leerSolicitudesDemo(sessionStorage), error: false }; }
  catch { return { solicitudes: [], error: true }; }
}

// Solo demostración pública: NO está asociada a cuentas de Firebase.
export default function MyRequests() {
  const { lang } = useLanguage();
  const c = DEMO_REQUEST_COPY[lang] ?? DEMO_REQUEST_COPY.es;
  const [datos, setDatos] = useState(cargar);
  const [error, setError] = useState(datos.error);

  function eliminar(id) {
    if (!window.confirm(c.removeConfirm)) return;
    try {
      if (eliminarSolicitudDemo(sessionStorage, id)) {
        setDatos(cargar());
        setError(false);
      } else setError(true);
    } catch { setError(true); }
  }

  return (
    <div className="container section">
      <div className="page-title">
        <p className="overline">LA CASA DE JOSÉ · DEMO</p>
        <h1>{c.link}</h1>
        <p>{c.intro}</p>
      </div>
      <p className="notice warning" role="note">{c.howLong}</p>
      <p className="muted small">{c.privacy}</p>
      {error && <p className="notice error" role="alert">{c.deleteError}</p>}
      <div className="demo-requests-actions"><Link className="btn primary" to="/cotizar">{c.newRequest}</Link></div>
      {datos.solicitudes.length === 0 ? (
        <div className="form-panel empty-state"><span className="huge-icon" aria-hidden="true">◇</span><p>{c.empty}</p></div>
      ) : (
        <div className="requests-grid">
          {datos.solicitudes.map(s => (
            <article className="request-card" key={s.id}>
              <div className="between"><span className="overline">{s.id.slice(0, 14)}</span><span className="status">{c.pending}</span></div>
              <h2>{s.fechaEntrada} — {s.fechaSalida}</h2>
              <p>{c.nights}: {nochesEntre(s.fechaEntrada, s.fechaSalida)} · {c.guests}: {s.huespedes}</p>
              <ul className="demo-request-rooms">
                {s.detalleHabitaciones.map(d => {
                  const room = DEMO_ROOMS.find(r => r.id === d.habitacionId);
                  return <li key={d.habitacionId}>{d.cantidad} × {room ? nombreHabitacion(room, lang) : d.habitacionId}</li>;
                })}
              </ul>
              <div className="between"><span className="muted small">CLP (demo)</span><strong className="price">{formatoCLP(s.totalCotizado)}</strong></div>
              <button className="btn secondary small demo-request-delete" type="button" onClick={() => eliminar(s.id)}>{c.remove}</button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
