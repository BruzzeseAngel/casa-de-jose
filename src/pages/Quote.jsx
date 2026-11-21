import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { nombreHabitacion } from '../lib/contentTranslations';
import { DEMO_ROOMS, DEMO_RATES } from '../lib/demo';
import { QUOTE_COPY } from '../lib/quoteCopy';
import { formatoCLP, hoyChile, precioNetoPorNoche, vistaCotizacion } from '../lib/quote.mjs';

const habitaciones = DEMO_ROOMS.filter(habitacion => habitacion.activa);

// Formulario local de prueba: no realiza solicitudes HTTP ni guarda datos.
// La confirmación y el recálculo autoritativo corresponderán al backend futuro.
export default function Quote() {
  const { t, lang } = useLanguage();
  const q = QUOTE_COPY[lang] ?? QUOTE_COPY.es;
  const [searchParams] = useSearchParams();
  const habitacionSolicitada = searchParams.get('habitacion');
  const [entrada, setEntrada] = useState('');
  const [salida, setSalida] = useState('');
  const [huespedes, setHuespedes] = useState(2);
  const [seleccion, setSeleccion] = useState([]);
  const [contacto, setContacto] = useState({ nombre: '', email: '', telefono: '' });
  const [comentarios, setComentarios] = useState('');
  const [estacionamiento, setEstacionamiento] = useState(false);
  const [validado, setValidado] = useState(false);
  const [error, setError] = useState('');

  // Permite llegar desde el botón Cotizar de una ficha sin duplicar categorías.
  useEffect(() => {
    if (!habitacionSolicitada || !habitaciones.some(h => h.id === habitacionSolicitada)) return;
    setSeleccion(actual => actual.some(s => s.habitacionId === habitacionSolicitada)
      ? actual : [...actual, { habitacionId: habitacionSolicitada, cantidad: 1 }]);
  }, [habitacionSolicitada]);

  const hoy = hoyChile();
  const vista = useMemo(() => vistaCotizacion({
    entrada, salida, seleccion, habitaciones, tarifasPorHabitacion: DEMO_RATES,
  }), [entrada, salida, seleccion]);
  const capacidadSuficiente = Boolean(vista) && Number.isInteger(huespedes)
    && huespedes > 0 && huespedes <= vista.capacidad;
  const valido = Boolean(vista) && entrada >= hoy && capacidadSuficiente;

  function agregar(id) {
    setSeleccion(actual => actual.some(s => s.habitacionId === id)
      ? actual : [...actual, { habitacionId: id, cantidad: 1 }]);
    setValidado(false);
    setError('');
  }

  function cambiarCantidad(id, cantidad) {
    setSeleccion(actual => actual.map(s => s.habitacionId === id
      ? { ...s, cantidad: Number(cantidad) } : s));
    setValidado(false);
  }

  function quitar(id) {
    setSeleccion(actual => actual.filter(s => s.habitacionId !== id));
    setValidado(false);
  }

  function comprobarFormulario(evento) {
    evento.preventDefault(); // No existe un endpoint de envío en esta etapa.
    setValidado(false);
    if (!valido) {
      setError(q.incomplete);
      return;
    }
    setError('');
    setValidado(true); // Solo confirma validación en memoria del navegador.
  }

  return (
    <div className="container section">
      <div className="page-title">
        <p className="overline">LA CASA DE JOSÉ</p>
        <h1>{t('quoteTitle')}</h1>
        <p>{t('quoteSub')}</p>
      </div>
      <p className="notice warning" role="note">{q.disclaimer}</p>
      <form className="quote-layout" onSubmit={comprobarFormulario}>
        <section className="form-panel quote-main">
          <div className="group-heading"><span className="step">01</span><div>
            <h2>{t('learn')}</h2><p>{q.maxNights}</p>
          </div></div>
          <div className="form-grid three">
            <label className="field">{t('checkin')}
              <input type="date" required min={hoy} value={entrada} onChange={e => {
                setEntrada(e.target.value);
                if (salida && salida <= e.target.value) setSalida('');
                setValidado(false);
              }} />
            </label>
            <label className="field">{t('checkout')}
              <input type="date" required min={entrada || hoy} value={salida}
                onChange={e => { setSalida(e.target.value); setValidado(false); }} />
            </label>
            <label className="field">{t('guests')}
              <input type="number" required min="1" max="100" step="1" value={huespedes}
                onChange={e => { setHuespedes(Number(e.target.value)); setValidado(false); }} />
            </label>
          </div>
          <hr className="soft-rule" />
          <div className="group-heading"><span className="step">02</span><div>
            <h2>{t('roomsChoice')}</h2><p>{t('addRoom')}</p>
          </div></div>
          <div className="quote-category-grid" role="group" aria-label={t('addRoom')}>
            {habitaciones.map(h => {
              const agregada = seleccion.some(s => s.habitacionId === h.id);
              const tarifa = DEMO_RATES[h.id]?.[0];
              return (
                <button type="button" key={h.id} disabled={agregada}
                  className="quote-category-choice" onClick={() => agregar(h.id)}>
                  <strong>{nombreHabitacion(h, lang)}</strong>
                  <small>{h.capacidad} {t('guests').toLowerCase()} · {q.roomRate}: {formatoCLP(precioNetoPorNoche(tarifa))}</small>
                  <span>{agregada ? q.added : `＋ ${q.add}`}</span>
                </button>
              );
            })}
          </div>
          <div className="selected-list">
            {seleccion.length === 0 ? <p className="empty-note">{t('emptySelection')}</p>
              : seleccion.map(s => {
                const h = habitaciones.find(item => item.id === s.habitacionId);
                return (
                  <div className="selected-row" key={s.habitacionId}>
                    <div className="selected-name">
                      <strong>{nombreHabitacion(h, lang)}</strong>
                      <small>{h.capacidad} {t('guests').toLowerCase()} / {t('units').toLowerCase()}</small>
                    </div>
                    <label className="qty">{t('quantity')}
                      <input type="number" min="1" max={h.stockTotal} step="1" value={s.cantidad}
                        onChange={e => cambiarCantidad(s.habitacionId, e.target.value)} />
                    </label>
                    <button type="button" className="icon-btn"
                      aria-label={`${t('remove')} ${nombreHabitacion(h, lang)}`}
                      onClick={() => quitar(s.habitacionId)}>×</button>
                  </div>
                );
              })}
          </div>
          <hr className="soft-rule" />
          <div className="group-heading"><span className="step">03</span><div>
            <h2>{t('contact')}</h2><p>{q.privacy}</p>
          </div></div>
          <div className="form-grid">
            <label className="field">{t('name')}
              <input type="text" required minLength="3" maxLength="80" autoComplete="off" value={contacto.nombre}
                onChange={e => { setContacto({ ...contacto, nombre: e.target.value }); setValidado(false); }} />
            </label>
            <label className="field">{t('email')}
              <input type="email" required maxLength="150" autoComplete="off" value={contacto.email}
                onChange={e => { setContacto({ ...contacto, email: e.target.value }); setValidado(false); }} />
            </label>
            <label className="field">{t('phone')}
              <input type="tel" autoComplete="off" maxLength="30" value={contacto.telefono}
                onChange={e => { setContacto({ ...contacto, telefono: e.target.value }); setValidado(false); }} />
            </label>
            <label className="field">{q.notes}
              <textarea rows="3" maxLength="500" placeholder={q.notesPlaceholder} value={comentarios}
                onChange={e => { setComentarios(e.target.value); setValidado(false); }} />
            </label>
          </div>
          <label className="checkbox-line">
            <input type="checkbox" checked={estacionamiento}
              onChange={e => { setEstacionamiento(e.target.checked); setValidado(false); }} />
            <span>{t('parking')}</span>
          </label>
        </section>
        <aside className="form-panel quote-summary" aria-live="polite">
          <h2>{t('quotePreview')}</h2>
          <p className="muted small">{q.disclaimer}</p>
          <hr className="soft-rule" />
          <div className="summary-list">
            <div><span>{t('nights')}</span><strong>{vista?.noches ?? '—'}</strong></div>
            {vista?.detalles.map(detalle => {
              const h = habitaciones.find(item => item.id === detalle.habitacionId);
              return (
                <div key={detalle.habitacionId}>
                  <span>{nombreHabitacion(h, lang)} × {detalle.cantidad}</span>
                  <strong>{formatoCLP(detalle.subtotal)}</strong>
                </div>
              );
            })}
          </div>
          {vista && (
            <div className="quote-tax-breakdown">
              <div><span>{q.subtotal}</span><strong>{formatoCLP(vista.neto)}</strong></div>
              <div><span>{q.vat}</span><strong>{formatoCLP(vista.iva)}</strong></div>
            </div>
          )}
          <div className="grand-total">
            <span>{q.amount}</span><strong>{vista ? formatoCLP(vista.total) : '—'}</strong>
          </div>
          {!vista && seleccion.length > 0 && entrada && salida &&
            <p className="notice warning">{t('invalidDates')}</p>}
          {vista && !capacidadSuficiente &&
            <p className="notice warning">{t('invalidGuests')}</p>}
          {error && <p className="notice error" role="alert">{error}</p>}
          {validado && <p className="notice success" role="status">{q.validated}</p>}
          <p className="muted small">{q.taxes}</p>
          <button type="submit" className="btn primary block">{q.validate}</button>
          <p className="muted small demo-note">{q.privacy}</p>
          <Link to="/habitaciones" className="text-link">← {t('viewRoom')}</Link>
        </aside>
      </form>
    </div>
  );
}
