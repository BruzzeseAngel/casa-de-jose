import {Link} from 'react-router-dom';
import {useLanguage} from '../context/LanguageContext';
import {nombreHabitacion,traducirLista} from '../lib/contentTranslations';
import {seleccionarTarifa,formatoCLP,precioNetoPorNoche,hoyChile} from '../lib/quote.mjs';
import CurrencyEstimate from './CurrencyEstimate';
import PhotoGallery from './PhotoGallery';

// Tarjetas del catálogo: fotos y navegación hacia ficha o cotización preseleccionada.
export default function RoomCard({habitacion,tarifas=[]}) {
  const {t,lang}=useLanguage();
  const nombre=nombreHabitacion(habitacion,lang);
  const tarifa=seleccionarTarifa(tarifas,hoyChile());
  return <article className="room-card">
    <PhotoGallery fotos={habitacion.fotos} alt={nombre} className={`room-photo photo-variant-${(habitacion.index??habitacion.nombre?.length??0)%6}`}>
      <span className="photo-tag">{t('capacity')}: {habitacion.capacidad}</span>
    </PhotoGallery>
    <div className="room-card-body"><h3>{nombre}</h3><p className="room-details">{habitacion.tamanoM2} m² <span>·</span> {habitacion.stockTotal} {t('units').toLowerCase()}</p>
      <p className="amenity-teaser">{traducirLista(habitacion.comodidades?.slice(0,3),lang).join(' · ')}</p>
      {tarifa&&<div className="price-comparison">
        <p className="room-price">{t('from')} <strong>{formatoCLP(precioNetoPorNoche(tarifa))}</strong><small> / {t('perNight')}</small></p>
        <span className="price-tax-label">{t('vatExcluded')}</span>
        <CurrencyEstimate pesos={precioNetoPorNoche(tarifa)}/>
        {tarifa.precioReferencia!=null&&Number(tarifa.precioReferencia)>0&&<p className="reference-price">{t('reference')}: <s>{formatoCLP(Number(tarifa.precioReferencia))}</s> / {t('perNight')} <span className="price-tax-label">{t('vatExcluded')}</span><CurrencyEstimate pesos={Number(tarifa.precioReferencia)}/></p>}
      </div>}
      <div className="room-card-links">
        <Link className="text-link" to={`/habitaciones/${encodeURIComponent(habitacion.id)}`}>{t('roomDetails')} →</Link>
        <Link className="text-link" to={`/cotizar?habitacion=${encodeURIComponent(habitacion.id)}`}>{t('quoteNow')} →</Link>
      </div>
    </div>
  </article>;
}
