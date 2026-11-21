import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { nombreHabitacion, traducirLista } from '../lib/contentTranslations';
import { DEMO_ROOMS } from '../lib/demo';
import PhotoGallery from '../components/PhotoGallery';

export default function RoomDetail() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const room = DEMO_ROOMS.find(item => item.id === id && item.activa);
  if (!room) {
    return <div className="container section"><p className="notice error">{t('notFound')}</p>
      <Link to="/habitaciones" className="btn secondary">{t('viewRoom')}</Link></div>;
  }
  const nombre = nombreHabitacion(room, lang);
  return (
    <div className="container section room-detail-page">
      <Link className="text-link detail-back" to="/habitaciones">← {t('viewRoom')}</Link>
      <div className="room-detail-grid">
        <PhotoGallery fotos={room.fotos} alt={nombre} className="room-detail-gallery" />
        <section className="form-panel room-detail-info">
          <p className="overline">LA CASA DE JOSÉ</p><h1>{nombre}</h1>
          <p className="muted">{t('capacity')}: {room.capacidad} · {t('size')}: {room.tamanoM2} m²</p>
          <h2>{t('beds')}</h2>
          <ul>{traducirLista(room.camas, lang).map(item => <li key={item}>{item}</li>)}</ul>
          <h2>{t('amenities')}</h2>
          <ul>{traducirLista(room.comodidades, lang).map(item => <li key={item}>{item}</li>)}</ul>
          <p className="notice soft">{t('availability')}</p>
          <Link className="btn primary" to={`/cotizar?habitacion=${encodeURIComponent(room.id)}`}>{t('quoteNow')} →</Link>
        </section>
      </div>
    </div>
  );
}
