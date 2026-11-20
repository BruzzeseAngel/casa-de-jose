import { useLanguage } from '../context/LanguageContext';
import { DEMO_ROOMS } from '../lib/demo';
import RoomCard from '../components/RoomCard';

export default function Rooms() {
  const { t } = useLanguage();
  const rooms = DEMO_ROOMS.filter(room => room.activa);
  return (
    <div className="container section">
      <div className="page-title">
        <p className="overline">LA CASA DE JOSÉ</p>
        <h1>{t('roomSection')}</h1><p>{t('roomSub')}</p>
      </div>
      <div className="room-grid">
        {rooms.map(room => <RoomCard key={room.id} habitacion={room} />)}
      </div>
      <p className="notice soft">{t('availability')}</p>
    </div>
  );
}
