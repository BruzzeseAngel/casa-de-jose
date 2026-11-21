import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { DEMO_REQUEST_COPY } from '../lib/demoRequestCopy';
import { AUTH_COPY } from '../lib/authCopy';
import { useAuth } from '../context/AuthContext';
import { DEMO } from '../lib/firebase';

// Navegación pública y selector de idiomas a partir del diseño original.
const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
];

export default function Layout() {
  const { t, lang, setLang } = useLanguage();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const languageMenu = useRef(null);
  const current = LANGUAGES.find(item => item.code === lang) ?? LANGUAGES[0];
  const demoCopy = DEMO_REQUEST_COPY[lang] ?? DEMO_REQUEST_COPY.es;
  const authCopy = AUTH_COPY[lang] ?? AUTH_COPY.es;
  const accountLink = DEMO ? ['/solicitudes-demo', demoCopy.link]
    : user ? ['/mis-solicitudes', authCopy.account] : ['/acceso', authCopy.signIn];
  const links = [['/', t('home')], ['/habitaciones', t('rooms')], ['/servicios', t('services')], ['/cotizar', t('quote')], accountLink];

  useEffect(() => {
    const closeOutside = event => {
      if (languageMenu.current && !languageMenu.current.contains(event.target)) {
        languageMenu.current.open = false;
      }
    };
    const closeEsc = event => {
      if (event.key === 'Escape' && languageMenu.current?.open) {
        languageMenu.current.open = false;
        languageMenu.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEsc);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeEsc);
    };
  }, []);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner container">
          <Link to="/" className="brand" aria-label="La Casa de José — inicio">
            <span className="brand-main">CASA DE JOSÉ</span>
            <span className="brand-sub">SAN PEDRO DE ATACAMA</span>
          </Link>
          <button className="menu-toggle" type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
          <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Navegación principal">
            {links.map(([url, label]) => (
              <NavLink key={url} end={url === '/'} to={url}
                className={({ isActive }) => isActive ? 'nav-active' : ''}
                onClick={() => setMenuOpen(false)}>{label}</NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <details className="lang-picker" ref={languageMenu}>
              <summary className="lang-picker-toggle" aria-label={`Idioma actual: ${current.name}. Seleccionar idioma`}>
                <img className="lang-flag" src={`/flags/${current.code}.svg`} alt="" aria-hidden="true" />
                <strong>{current.code.toUpperCase()}</strong>
                <span aria-hidden="true">⌄</span>
              </summary>
              <div className="lang-picker-menu">
                {LANGUAGES.map(item => (
                  <button key={item.code} type="button" aria-current={lang === item.code ? 'true' : undefined}
                    className={`lang-picker-option ${lang === item.code ? 'is-selected' : ''}`}
                    onClick={() => { setLang(item.code); languageMenu.current.open = false; }}>
                    <img className="lang-flag" src={`/flags/${item.code}.svg`} alt="" aria-hidden="true" />
                    <span>{item.name}</span><small>{item.code.toUpperCase()}</small>
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      </header>
      <div className="demo-banner"><div className="container">{t('demo')}</div></div>
      <main id="contenido"><Outlet /></main>
      <footer className="footer">
        <div className="container footer-inner">
          <div><strong>CASA DE JOSÉ</strong><p>{t('footer')}</p></div>
          <p>San Pedro de Atacama, Chile<br />{t('publicInfo')}</p>
        </div>
      </footer>
    </div>
  );
}
