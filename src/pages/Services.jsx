import { useLanguage } from '../context/LanguageContext';
import { traducirTexto } from '../lib/contentTranslations';
import { DEMO_SERVICES } from '../lib/demo';
import PhotoGallery from '../components/PhotoGallery';

const symbols = ['♒', '◇', '☕', '♨', '✺', '✧'];

export default function Services() {
  const { t, lang } = useLanguage();
  const items = DEMO_SERVICES.filter(service => service.activo);
  return (
    <div className="container section">
      <div className="page-title"><p className="overline">LA CASA DE JOSÉ</p>
        <h1>{t('serviceSection')}</h1><p>{t('serviceSub')}</p></div>
      <div className="services-grid">
        {items.map((item, i) => (
          <article className="service-card" key={item.id}>
            {item.fotos?.length ? (
              <PhotoGallery fotos={item.fotos} alt={traducirTexto(item.nombre, lang)}
                className={`service-art service-art-${i % 4}`} />
            ) : (
              <div className={`service-art service-art-${i % 4}`}>
                <span aria-hidden="true">{item.emoji || symbols[i % symbols.length]}</span>
              </div>
            )}
            <div className="service-body">
              <small className="overline">{traducirTexto(item.categoria, lang)}</small>
              <h2>{traducirTexto(item.nombre, lang)}</h2>
              <p>{traducirTexto(item.descripcion, lang)}</p>
              <p className="muted">{traducirTexto(item.modalidad, lang)}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="notice soft">{t('availability')}</p>
    </div>
  );
}
