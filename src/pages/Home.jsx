import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { DEMO_ROOMS } from '../lib/demo';
import RoomCard from '../components/RoomCard';

export default function Home() {
  const { t } = useLanguage();
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="overline">{t('eyebrow')}</p>
            <h1>{t('welcome')}</h1>
            <p>{t('welcomeText')}</p>
            <div className="hero-actions">
              <Link className="btn primary" to="/habitaciones">{t('explore')} →</Link>
              <Link className="btn light" to="/servicios">{t('discover')}</Link>
              <Link className="btn secondary" to="/cotizar">{t('quoteNow')}</Link>
            </div>
            <div className="hero-points"><span>✓ {t('whyTwo')}</span><span>✓ {t('whyThree')}</span></div>
          </div>
          <div className="hero-art" role="img" aria-label="Ilustración decorativa de un alojamiento en Atacama">
            <div className="sun" /><div className="hill h1" /><div className="hill h2" />
            <div className="house"><div className="roof" /><div className="door" /><div className="window w1" /><div className="window w2" /></div>
            <div className="hero-art-caption">ATACAMA · CHILE</div>
          </div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading">
          <div><p className="overline">LA CASA DE JOSÉ</p><h2>{t('roomSection')}</h2><p>{t('roomSub')}</p></div>
          <Link className="text-link" to="/habitaciones">{t('viewRoom')} →</Link>
        </div>
        <div className="room-grid">
          {DEMO_ROOMS.filter(room => room.activa).slice(0, 3).map(room => (
            <RoomCard key={room.id} habitacion={room} />
          ))}
        </div>
      </section>
      <section className="teal-section">
        <div className="container teaser-grid">
          <div><p className="overline">LA CASA DE JOSÉ</p><h2>{t('serviceSection')}</h2><p>{t('serviceSub')}</p>
            <Link className="btn outline-white" to="/servicios">{t('discover')} →</Link>
          </div>
          <div className="teaser-mark" aria-hidden="true">☼<span>◇</span></div>
        </div>
      </section>
      <section className="container section">
        <div className="section-heading"><div><h2>{t('why')}</h2><p>{t('whySub')}</p></div></div>
        <div className="feature-grid">
          {[['↗', t('whyOne')], ['♡', t('whyTwo')], ['◎', t('whyThree')]].map(([symbol, label]) => (
            <div className="feature" key={label}><span>{symbol}</span><h3>{label}</h3></div>
          ))}
        </div>
        <p className="notice soft" role="note">{t('availability')}</p>
      </section>
    </>
  );
}
