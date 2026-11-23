import {useEffect,useRef,useState} from 'react';
import {NavLink,Outlet,Link} from 'react-router-dom';
import {useLanguage} from '../context/LanguageContext';
import {useAuth} from '../context/AuthContext';
import {DEMO} from '../lib/firebase';
import CurrencySelector from './CurrencySelector';

// Banderas SVG locales: se ven correctamente incluso cuando Windows no muestra emojis de banderas.
// El idioma almacenado continúa usando los códigos originales (es, en, pt, de, fr).
const LANGUAGES = [
  {code:'es', short:'ES', name:'Español'},
  {code:'en', short:'EN', name:'English'},
  {code:'pt', short:'PT', name:'Português (Brasil)'},
  {code:'de', short:'DE', name:'Deutsch'},
  {code:'fr', short:'FR', name:'Français'},
];

// Cabecera única para todas las páginas; menú accesible que se contrae en móviles.
export default function Layout(){
  const {t,lang,setLang}=useLanguage(); const {user,admin,logout}=useAuth();const [open,setOpen]=useState(false);
  const languageRef=useRef(null);
  const currentLanguage=LANGUAGES.find(item=>item.code===lang)||LANGUAGES[0];

  // Cierra el menú al hacer clic fuera o presionar Escape, sin afectar la navegación móvil.
  useEffect(()=>{
    const onPointerDown=(event)=>{
      if(languageRef.current&&!languageRef.current.contains(event.target)) languageRef.current.open=false;
    };
    const onKeyDown=(event)=>{
      if(event.key==='Escape'&&languageRef.current?.open){
        languageRef.current.open=false;
        languageRef.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown',onPointerDown);
    document.addEventListener('keydown',onKeyDown);
    return ()=>{
      document.removeEventListener('pointerdown',onPointerDown);
      document.removeEventListener('keydown',onKeyDown);
    };
  },[]);
  const links=[['/',t('home')],['/habitaciones',t('rooms')],['/servicios',t('services')],['/cotizar',t('quote')]];
  return <div className="app-shell">
    <header className="site-header"><div className="header-inner container">
      <Link to="/" className="brand" aria-label="La Casa de José — inicio"><span className="brand-main">CASA DE JOSÉ</span><span className="brand-sub">SAN PEDRO DE ATACAMA</span></Link>
      <button className="menu-toggle" type="button" aria-label={open?'Cerrar menú':'Abrir menú'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?'✕':'☰'}</button>
      <nav className={`main-nav ${open?'nav-open':''}`} aria-label="Navegación principal">
        {links.map(([path,label])=><NavLink key={path} end={path==='/'} to={path} className={({isActive})=>isActive?'nav-active':''} onClick={()=>setOpen(false)}>{label}</NavLink>)}
        {user&&<NavLink to={admin?'/admin':'/mis-solicitudes'} onClick={()=>setOpen(false)}>{admin?t('admin'):t('myRequests')}</NavLink>}
      </nav>
      <div className="header-actions">
        {/* Divisa global: situada junto al idioma y compartida por todas las páginas. */}
        <CurrencySelector/>
        {/* Selector de idiomas con banderas SVG locales. Un <select> nativo no dibuja
            las banderas emoji de forma consistente en navegadores de Windows. */}
        <details className="lang-picker" ref={languageRef}>
          <summary className="lang-picker-toggle" aria-label={`Idioma actual: ${currentLanguage.name}. Seleccionar idioma`}>
            <img src={`/flags/${currentLanguage.code}.svg`} alt="" aria-hidden="true" className="lang-flag" />
            <strong>{currentLanguage.short}</strong>
            <span className="lang-chevron" aria-hidden="true">⌄</span>
          </summary>
          <div className="lang-picker-menu" aria-label="Idiomas disponibles">
            {LANGUAGES.map(choice=><button key={choice.code} type="button"
              className={`lang-picker-option ${lang===choice.code?'is-selected':''}`}
              aria-current={lang===choice.code?'true':undefined}
              onClick={()=>{
                setLang(choice.code);
                if(languageRef.current) languageRef.current.open=false;
              }}>
              <img src={`/flags/${choice.code}.svg`} alt="" aria-hidden="true" className="lang-flag" />
              <span>{choice.name}</span>
              <span className="lang-code">{choice.short}</span>
            </button>)}
          </div>
        </details>
        {user?<button className="nav-login" onClick={logout} type="button">{t('logout')}</button>:<Link className="nav-login" to="/acceso">{t('login')}</Link>}
      </div>
    </div></header>
    {DEMO&&<div className="demo-banner"><div className="container">{t('demo')}</div></div>}
    <main id="contenido"><Outlet/></main>
    <footer className="footer"><div className="container footer-inner"><div><strong>CASA DE JOSÉ</strong><p>{t('footer')}</p></div><p>San Pedro de Atacama, Chile<br/>{t('publicInfo')}</p></div></footer>
  </div>;
}
