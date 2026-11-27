import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerHabitaciones, obtenerTarifas } from '../lib/data';
import { useLanguage } from '../context/LanguageContext';
import { nombreHabitacion, traducirLista } from '../lib/contentTranslations';
import { seleccionarTarifa, formatoCLP, precioNetoPorNoche, hoyChile } from '../lib/quote.mjs';
import CurrencyEstimate from '../components/CurrencyEstimate';
import PhotoGallery from '../components/PhotoGallery';
/** Ficha de una categoría usando los campos existentes del diccionario 6.3.1.
 * No promete disponibilidad: stockTotal no equivale a ocupación para fechas.
 */
// La ruta de detalle identifica la categoría y presenta sus características y tarifa orientativa.
export default function RoomDetail() {
  const { id } = useParams(), { t, lang } = useLanguage();
  const [room, setRoom] = useState(null), [rates, setRates] = useState([]), [loading, setLoading] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    (async () => {
      try {
        const all = await obtenerHabitaciones();
        const found = all.find(r => r.id === id);
        if (!found)
          throw Error(t('notFound'));
        const list = await obtenerTarifas(id);
        if (active) {
          setRoom(found);
          setRates(list);
        }
      }
      catch (e) {
        if (active)
          setError(e.message);
      }
      finally {
        if (active)
          setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);
  if (loading)
    return <div className="container section">
      <p>{t('loading')}</p>
    </div>;
  if (error || !room)
    return <div className="container section">
      <p role="alert" className="notice error">{error || t('notFound')}</p>
      <Link to="/habitaciones" className="btn secondary">{t('viewRoom')}</Link>
    </div>;
  const name = nombreHabitacion(room, lang), tarifa = seleccionarTarifa(rates, hoyChile());
  return <div className="container section room-detail-page">
    <Link className="text-link detail-back" to="/habitaciones">← {t('viewRoom')}</Link>
    <div className="room-detail-grid">
      <PhotoGallery fotos={room.fotos} alt={name} className="room-detail-gallery" />
      <section className="form-panel room-detail-info">
        <p className="overline">LA CASA DE JOSÉ</p>
        <h1>{name}</h1>
        <p className="muted">{t('capacity')}: {room.capacidad} · {t('size')}: {room.tamanoM2} m² · {room.stockTotal} {t('units').toLowerCase()}</p>
        <h2>{t('beds')}</h2>
        <ul>
          {traducirLista(room.camas, lang).map((item, i) => <li key={i}>{item}</li>)}
        </ul>
        <h2>{t('amenities')}</h2>
        <ul>
          {traducirLista(room.comodidades, lang).map((item, i) => <li key={i}>{item}</li>)}
        </ul>
        {tarifa && <div className="price-comparison">
          <p className="room-price">{t('from')} <strong>{formatoCLP(precioNetoPorNoche(tarifa))}</strong> / {t('perNight')}</p>
          <span className="price-tax-label">{t('vatExcluded')}</span>
          <CurrencyEstimate pesos={precioNetoPorNoche(tarifa)} />
          {tarifa.precioReferencia != null && Number(tarifa.precioReferencia) > 0 && <p className="reference-price">{t('reference')}: <s>{formatoCLP(Number(tarifa.precioReferencia))}</s> <span className="price-tax-label">{t('vatExcluded')}</span><CurrencyEstimate pesos={Number(tarifa.precioReferencia)} /></p>}
        </div>}
        <p className="notice soft">{t('availability')}</p>
        <Link className="btn primary" to={`/cotizar?habitacion=${encodeURIComponent(room.id)}`}>{t('quoteNow')} →</Link>
      </section>
    </div>
  </div>;
}
