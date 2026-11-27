import { useEffect, useState } from 'react';
import { obtenerHabitaciones, obtenerTarifas } from '../lib/data';
import { useLanguage } from '../context/LanguageContext';
import RoomCard from '../components/RoomCard';
// El catálogo reutiliza RoomCard y las consultas de tarifas por categoría.
export default function Rooms() {
  const { t } = useLanguage(), [rooms, setRooms] = useState([]), [rates, setRates] = useState({}), [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await obtenerHabitaciones();
        const all = await Promise.all(data.map(h => obtenerTarifas(h.id)));
        if (mounted) {
          setRooms(data);
          setRates(Object.fromEntries(data.map((h, i) => [h.id, all[i]])));
        }
      }
      catch (e) {
        if (mounted)
          setError(e.message);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return <div className="container section">
    <div className="page-title-with-currency">
      <div className="page-title">
        <p className="overline">LA CASA DE JOSÉ</p>
        <h1>{t('roomSection')}</h1>
        <p>{t('roomSub')}</p>
      </div>
    </div>
    {error && <p role="alert" className="notice error">{error}</p>}
    <div className="room-grid">
      {rooms.map(h => <RoomCard key={h.id} habitacion={h} tarifas={rates[h.id]} />)}
    </div>
    {rooms.length === 0 && !error && <p>{t('notFound')}</p>}
    <p className="notice soft">{t('availability')}</p>
  </div>;
}
