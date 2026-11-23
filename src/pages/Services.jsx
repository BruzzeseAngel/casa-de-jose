import {useEffect,useState} from 'react';
import PhotoGallery from '../components/PhotoGallery';
import {obtenerServicios} from '../lib/data';
import {useLanguage} from '../context/LanguageContext';
import {traducirTexto} from '../lib/contentTranslations';
const symbols=['♒','◇','☕','♨','✺','✧'];
export default function Services(){
 const {t,lang}=useLanguage(),[items,setItems]=useState([]),[error,setError]=useState('');
 useEffect(()=>{let active=true;obtenerServicios().then(s=>{if(active)setItems(s)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[]);
 return <div className="container section"><div className="page-title"><p className="overline">LA CASA DE JOSÉ</p><h1>{t('serviceSection')}</h1><p>{t('serviceSub')}</p></div>{error&&<p role="alert" className="notice error">{error}</p>}<div className="services-grid">{items.map((s,i)=><article className="service-card" key={s.id}>{s.fotos?.length?<PhotoGallery fotos={s.fotos} alt={traducirTexto(s.nombre,lang)} className={`service-art service-art-${i%4}`}/>
      :<div className={`service-art service-art-${i%4}`}><span>{s.emoji||symbols[i%symbols.length]}</span></div>}<div className="service-body"><small className="overline">{traducirTexto(s.categoria,lang)}</small><h2>{traducirTexto(s.nombre,lang)}</h2><p>{traducirTexto(s.descripcion,lang)}</p><p className="muted">{traducirTexto(s.modalidad,lang)}</p></div></article>)}</div><p className="notice soft">{t('availability')}</p></div>;
}
