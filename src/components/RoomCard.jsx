import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { nombreHabitacion, traducirLista } from '../lib/contentTranslations';
import PhotoGallery from './PhotoGallery';

// Catálogo de demostración sin tarifas ni disponibilidad en tiempo real.
export default function RoomCard({ habitacion }) {
  const { t, lang } = useLanguage();
  const nombre = nombreHabitacion(habitacion, lang);
  return (
    <article className="room-card">
      <PhotoGallery fotos={habitacion.fotos} alt={nombre}
        className={`room-photo photo-variant-${habitacion.index % 6}`}>
        <span className="photo-tag">{t('capacity')}: {habitacion.capacidad}</span>
      </PhotoGallery>
      <div className="room-card-body">
        <h3>{nombre}</h3>
        <p className="room-details">{habitacion.tamanoM2} m² · {habitacion.stockTotal} {t('units').toLowerCase()}</p>
        <p className="amenity-teaser">{traducirLista(habitacion.comodidades.slice(0, 3), lang).join(' · ')}</p>
        <Link className="text-link" to={`/habitaciones/${encodeURIComponent(habitacion.id)}`}>
          {t('roomDetails')} →
        </Link>
      </div>
    </article>
  );
}
