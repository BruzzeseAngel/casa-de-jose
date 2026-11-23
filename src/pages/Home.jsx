import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {useLanguage} from '../context/LanguageContext';
import {obtenerHabitaciones,obtenerTarifas,obtenerServicios,obtenerConfiguracionPortada} from '../lib/data';
import RoomCard from '../components/RoomCard';
import PhotoGallery from '../components/PhotoGallery';

export default function Home(){
 const {t}=useLanguage();const [rooms,setRooms]=useState([]),[tarifas,setTarifas]=useState({}),[services,setServices]=useState([]);const [portada,setPortada]=useState({fotos:[],incluirFotosServicios:true}),[error,setError]=useState('');
 useEffect(()=>{let active=true;(async()=>{try{const r=await obtenerHabitaciones();const rates=await Promise.all(r.map(h=>obtenerTarifas(h.id)));if(active){setRooms(r);setTarifas(Object.fromEntries(r.map((h,i)=>[h.id,rates[i]])));}}catch(e){if(active)setError(e.message)}})();return()=>{active=false}},[]);
 // La portada usa exclusivamente fotografías de instalaciones o espacios comunes.
 useEffect(()=>{let active=true;Promise.all([obtenerServicios(),obtenerConfiguracionPortada()])
   .then(([items,config])=>{if(active){setServices(items);setPortada(config)}})
   .catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[]);
 // Fotos independientes subidas desde Administración → Portada siempre primero.
 // Opcionalmente se agregan fotos de servicios ACTIVOS marcados para portada.
 // No leemos fotos de habitaciones ni de servicios ocultos.
 const heroPhotos=[...(portada.fotos||[]),
   ...(portada.incluirFotosServicios!==false?services.filter(s=>s.activo&&s.mostrarPortada===true)
     .flatMap(s=>(Array.isArray(s.fotos)?s.fotos:[]).filter(Boolean)):[])].slice(0,12);
 return <>
 <section className="hero"><div className="container hero-grid"><div className="hero-copy"><p className="overline">{t('eyebrow')}</p><h1>{t('welcome')}</h1><p>{t('welcomeText')}</p><div className="hero-actions"><Link className="btn primary" to="/cotizar">{t('quoteNow')} <span>→</span></Link><Link className="btn light" to="/habitaciones">{t('explore')}</Link></div><div className="hero-points"><span>✓ {t('whyOne')}</span><span>✓ {t('whyTwo')}</span></div></div>
 {heroPhotos.length>0?<PhotoGallery fotos={heroPhotos} alt={t('homePhotos')} className="hero-art hero-real-photos"><div className="hero-art-caption">{t('homePhotos')}</div></PhotoGallery>:
 <div className="hero-art" role="img" aria-label="Ilustración decorativa de alojamiento cálido"><div className="sun"></div><div className="hill h1"></div><div className="hill h2"></div><div className="house"><div className="roof"></div><div className="door"></div><div className="window w1"></div><div className="window w2"></div></div><div className="hero-art-caption">ATACAMA <span>·</span> CHILE</div></div>}
 </div></section>
 <section className="container section"><div className="section-heading"><div><p className="overline">LA CASA DE JOSÉ</p><h2>{t('roomSection')}</h2><p>{t('roomSub')}</p></div><Link to="/habitaciones" className="text-link">{t('viewRoom')} →</Link></div>
 {error&&<p className="notice error" role="alert">{error}</p>}<div className="room-grid">{rooms.slice(0,3).map(h=><RoomCard key={h.id} habitacion={h} tarifas={tarifas[h.id]}/>)}</div></section>
 <section className="teal-section"><div className="container teaser-grid"><div><p className="overline">LA CASA DE JOSÉ</p><h2>{t('serviceSection')}</h2><p>{t('serviceSub')}</p><Link to="/servicios" className="btn outline-white">{t('discover')} →</Link></div><div className="teaser-mark" aria-hidden>☼<span>◇</span></div></div></section>
 <section className="container section"><div className="section-heading"><div><h2>{t('why')}</h2><p>{t('whySub')}</p></div></div><div className="feature-grid">{[['↗',t('whyOne')],['♡',t('whyTwo')],['◎',t('whyThree')]].map(([icon,text])=><div className="feature" key={text}><span>{icon}</span><h3>{text}</h3></div>)}</div><p className="notice soft" role="note">{t('availability')}</p></section>
 </>;
}
