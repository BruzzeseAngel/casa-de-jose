import { useLanguage } from '../context/LanguageContext';
import { useCatalog } from '../context/CatalogContext';
import RoomCard from '../components/RoomCard';

export default function Rooms() {
  const { t } = useLanguage();
  const { rooms, loading, error } = useCatalog();
  return (
    <div className="container section">
      <div className="page-title">
        <p className="overline">LA CASA DE JOSÉ</p>
        <h1>{t('roomSection')}</h1><p>{t('roomSub')}</p>
      </div>
      {loading && <p role="status">{t('loading')}</p>}
      {error && <p role="alert" className="notice error">{t(error)}</p>}
      {!loading && !error && rooms.length === 0 && <p className="notice soft">{t('notFound')}</p>}
      <div className="room-grid">
        {rooms.map(room => <RoomCard key={room.id} habitacion={room} />)}
      </div>
      <p className="notice soft">{t('availability')}</p>
    </div>
  );
}
