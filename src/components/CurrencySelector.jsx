import {useCurrency} from '../context/CurrencyContext';
import {useLanguage} from '../context/LanguageContext';
import {MONEDAS} from '../lib/currency.mjs';

/**
 * Selector compacto de divisas, situado en la cabecera junto al idioma.
 * Solo cambia las EQUIVALENCIAS informativas; los precios, el IVA y
 * las solicitudes oficiales continúan calculándose y guardándose en CLP.
 * CurrencyProvider recuerda la elección al cambiar de página.
 */
export default function CurrencySelector(){
 const {moneda,setMoneda,fecha,cargando,error}=useCurrency();
 const {t}=useLanguage();
 const estado=moneda==='CLP'?'':cargando?t('currencyLoading'):error?t('currencyUnavailable'):fecha?`${t('currencyUpdated')}: ${fecha}`:t('currencyLoading');
 return <div className="header-currency" title={estado||t('currencyLabel')}>
   <label className="currency-picker-nav">
    <span className="sr-only">{t('currencyLabel')}</span>
    <span className="currency-nav-icon" aria-hidden="true">⇄</span>
    <select value={moneda} onChange={e=>setMoneda(e.target.value)} aria-label={t('currencyLabel')}>
     {MONEDAS.map(c=><option value={c} key={c}>{c}</option>)}
    </select>
    <span className="currency-nav-chevron" aria-hidden="true">⌄</span>
   </label>
   {/* El estado se anuncia a lectores de pantalla; en escritorio aparece como
       tooltip al situar el cursor sobre el selector, sin agrandar la cabecera. */}
   <small className="sr-only" role="status">{estado}</small>
 </div>;
}
