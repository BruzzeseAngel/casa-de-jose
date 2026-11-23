import {useEffect,useMemo,useRef,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {useLanguage} from '../context/LanguageContext';
import {useAuth} from '../context/AuthContext';
import {DEMO} from '../lib/firebase';
import {obtenerHabitaciones,obtenerTarifas,crearSolicitud} from '../lib/data';
import {nombreHabitacion} from '../lib/contentTranslations';
import {hoyChile,vistaCotizacion,formatoCLP} from '../lib/quote.mjs';
import CurrencyEstimate from '../components/CurrencyEstimate';
import {useCurrency} from '../context/CurrencyContext';

// Cotización de una o varias categorías, con fotos y habitación preseleccionada.
// Vista previa en el navegador, cálculo DEFINITIVO por Cloud Function.
export default function Quote(){
 const {t,lang}=useLanguage(),{user,perfil}=useAuth();
 const {moneda}=useCurrency();
 const [searchParams]=useSearchParams();
 const [habitaciones,setHabitaciones]=useState([]),[tarifas,setTarifas]=useState({});
 const [entrada,setEntrada]=useState(''),[salida,setSalida]=useState(''),[huespedes,setHuespedes]=useState(2);
 const [seleccion,setSeleccion]=useState([]),[estacionamientoSolicitado,setEstacionamiento]=useState(false);
 const [contacto,setContacto]=useState({nombre:'',email:'',telefono:'',comentarios:''});
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[resultado,setResultado]=useState(null);
 const [pickerOpen,setPickerOpen]=useState(false);
 const lastPrefill=useRef(null);
 useEffect(()=>{let active=true;(async()=>{try{
  const data=await obtenerHabitaciones();const rates=await Promise.all(data.map(h=>obtenerTarifas(h.id)));
  if(active){setHabitaciones(data);setTarifas(Object.fromEntries(data.map((h,i)=>[h.id,rates[i]])));}
 }catch(e){if(active)setError(e.message)}})();return()=>{active=false}},[]);
 useEffect(() => {
  if (user)
    setContacto(prev => ({
      ...prev,
      nombre: prev.nombre || perfil?.nombre || user.displayName || '',
      email: prev.email || user.email || '',
      telefono: prev.telefono || perfil?.telefono || ''
    }));
}, [user, perfil]);
 // Un botón «Cotizar estadía» de una habitación lleva a /cotizar?habitacion=ID.
 // Solo aplicamos la precarga una vez por URL, sin duplicar la categoría.
 const requestedId=searchParams.get('habitacion');
 useEffect(()=>{
  if(!requestedId||!habitaciones.some(h=>h.id===requestedId)||lastPrefill.current===requestedId)return;
  setSeleccion(prev=>prev.some(row=>row.habitacionId===requestedId)?prev:[...prev,{habitacionId:requestedId,cantidad:1}]);
  lastPrefill.current=requestedId;
 },[requestedId,habitaciones]);
 const vista=useMemo(()=>vistaCotizacion({entrada,salida,seleccion,habitaciones,tarifasPorHabitacion:tarifas}),[entrada,salida,seleccion,habitaciones,tarifas]);
 const ivaDesglosado=vista?{neto:vista.neto,iva:vista.iva,total:vista.total}:null;
 const add=id=>{if(!id||seleccion.some(s=>s.habitacionId===id))return;setSeleccion(prev=>[...prev,{habitacionId:id,cantidad:1}]);setPickerOpen(false)};
 const change=(id,value)=>setSeleccion(prev=>prev.map(s=>s.habitacionId===id?{...s,cantidad:Number(value)}:s));
 async function enviar(e){e.preventDefault();setError('');setResultado(null);
  if(DEMO){setError(t('demoSubmit'));return;}
  if(!vista||entrada<hoyChile()){setError(t('invalidDates'));return;}
  if(Number(huespedes)<1||Number(huespedes)>vista.capacidad){setError(t('invalidGuests'));return;}
  // El teléfono es obligatorio en el nuevo formulario. En el servidor se hará
  // obligatorio también al publicar la actualización de Cloud Functions.
  if(!/^\+?[0-9 ()-]{7,30}$/.test(contacto.telefono.trim())||contacto.telefono.replace(/\D/g,'').length<7||contacto.telefono.replace(/\D/g,'').length>15){setError(t('phoneHint'));return;}
  setBusy(true);
  try{
   const data=await crearSolicitud({fechaEntrada:entrada,fechaSalida:salida,huespedes:Number(huespedes),estacionamientoSolicitado,idioma:lang,nombre:contacto.nombre.trim(),email:contacto.email.trim(),telefono:contacto.telefono.trim(),comentarios:contacto.comentarios.trim(),seleccion});
   setResultado(data);setSeleccion([]);setContacto(prev=>({...prev,comentarios:''}));
  }catch(err){setError(`${t('errorGeneric')} (${err.message})`)}finally{setBusy(false)}
 }
 return <div className="container section"><div className="page-title"><p className="overline">LA CASA DE JOSÉ</p><h1>{t('quoteTitle')}</h1><p>{t('quoteSub')}</p></div>
 <form className="quote-layout" onSubmit={enviar}>
  <section className="form-panel quote-main"><div className="group-heading"><span className="step">01</span><div><h2>{t('learn')}</h2><p>{t('availability')}</p></div></div>
   <div className="form-grid three"><label className="field">{t('checkin')}<input type="date" min={hoyChile()} value={entrada} required onChange={e=>{setEntrada(e.target.value);if(salida&&salida<=e.target.value)setSalida('')}}/></label>
   <label className="field">{t('checkout')}<input type="date" min={entrada||hoyChile()} value={salida} required onChange={e=>setSalida(e.target.value)}/></label>
   <label className="field">{t('guests')}<input type="number" min="1" max="100" required value={huespedes} onChange={e=>setHuespedes(Number(e.target.value))}/></label></div>
   <hr className="soft-rule"/>
   <div className="group-heading"><span className="step">02</span><div><h2>{t('roomsChoice')}</h2><p>{t('addRoom')}</p></div></div>
   <button className="category-picker-toggle" type="button" aria-expanded={pickerOpen} onClick={()=>setPickerOpen(v=>!v)}>＋ {t('addRoom')} <span aria-hidden>{pickerOpen?'⌃':'⌄'}</span></button>
   {pickerOpen&&<div className="category-picker-grid" role="group" aria-label={t('addRoom')}>
    {habitaciones.map(h=><button type="button" className="category-choice" key={h.id} disabled={seleccion.some(r=>r.habitacionId===h.id)} onClick={()=>add(h.id)}>
      {h.fotos?.[0]?<img src={h.fotos[0]} alt="" loading="lazy"/>:<span className="tiny-image empty">◇</span>}
      <span><strong>{nombreHabitacion(h,lang)}</strong><small>{h.capacidad} {t('guests').toLowerCase()} · {seleccion.some(r=>r.habitacionId===h.id)?t('chosenRoom'):t('chooseRoom')}</small></span>
    </button>)}
   </div>}
   <div className="selected-list">{seleccion.length===0?<p className="empty-note">{t('emptySelection')}</p>:seleccion.map(s=>{
    const h=habitaciones.find(x=>x.id===s.habitacionId);return <div className="selected-row" key={s.habitacionId}>
      <Link to={`/habitaciones/${encodeURIComponent(s.habitacionId)}`} className="tiny-image" title={t('showPhotos')}>{h?.fotos?.[0]?<img src={h.fotos[0]} alt={nombreHabitacion(h,lang)} loading="lazy"/>:'◇'}</Link>
      <div className="selected-name"><strong>{nombreHabitacion(h,lang)}</strong><small>{h?.capacidad} {t('guests').toLowerCase()} / {t('units').toLowerCase()} · <Link className="inline-link" to={`/habitaciones/${encodeURIComponent(s.habitacionId)}`}>{t('showPhotos')}</Link></small></div>
      <label className="qty">{t('quantity')}<input type="number" min="1" max={h?.stockTotal||1} value={s.cantidad} onChange={e=>change(s.habitacionId,e.target.value)}/></label>
      <button type="button" aria-label={`${t('remove')} ${nombreHabitacion(h,lang)}`} className="icon-btn" onClick={()=>setSeleccion(prev=>prev.filter(x=>x.habitacionId!==s.habitacionId))}>×</button>
    </div>})}</div>
   <hr className="soft-rule"/>
   <div className="group-heading"><span className="step">03</span><div><h2>{t('contact')}</h2><p>{t('accessSub')}</p></div></div>
   <div className="form-grid"><label className="field">{t('name')}<input required minLength="3" maxLength="80" autoComplete="name" value={contacto.nombre} onChange={e=>setContacto({...contacto,nombre:e.target.value})}/></label>
   <label className="field">{t('email')}<input required type="email" maxLength="150" autoComplete="email" value={contacto.email} onChange={e=>setContacto({...contacto,email:e.target.value})}/></label>
   <label className="field">{t('phone')}<input required type="tel" minLength="7" maxLength="30" autoComplete="tel" pattern="[+0-9 ()-]{7,30}" title={t('phoneHint')} placeholder="+56 9 1234 5678" value={contacto.telefono} onChange={e=>setContacto({...contacto,telefono:e.target.value})}/><small className="field-help">{t('phoneHint')}</small></label>
   <label className="field">{t('commentsOptional')}<textarea name="comentarios" rows="3" maxLength={500} placeholder={t('commentsPlaceholder')} value={contacto.comentarios} onChange={e=>setContacto({...contacto,comentarios:e.target.value})}/><small className="field-help">{contacto.comentarios.length}/500 {t('characters')}</small></label></div>
   <label className="checkbox-line"><input type="checkbox" checked={estacionamientoSolicitado} onChange={e=>setEstacionamiento(e.target.checked)}/><span>{t('parking')}</span></label>
  </section>
  <aside className="form-panel quote-summary"><h2>{t('quotePreview')}</h2><p className="muted small">{t('availability')}</p><hr className="soft-rule"/>
   <div className="summary-list"><div><span>{t('nights')}</span><strong>{vista?.noches??'—'}</strong></div>{vista?.detalles.map(item=>{
    const room=habitaciones.find(r=>r.id===item.habitacionId);
    return <div key={item.habitacionId}><span>{nombreHabitacion(room,lang)} × {item.cantidad}</span><strong>{formatoCLP(item.subtotal)}</strong></div>
   })}</div>
   {ivaDesglosado&&<div className="tax-breakdown" aria-label={t('vatDetail')}>
     <div><span>{t('vatNet')}</span><strong>{formatoCLP(ivaDesglosado.neto)}</strong></div>
     <div><span>{t('vatIncluded')}</span><strong>{formatoCLP(ivaDesglosado.iva)}</strong></div>
   </div>}
   <div className="grand-total"><span>{t('total')} ({t('vatGross')})</span><strong>{vista?formatoCLP(vista.total):'—'}</strong></div>
   {vista&&moneda!=='CLP'&&<div className="fx-quote-summary">
     <span>{t('currencyNetApprox')} <CurrencyEstimate pesos={vista.neto}/></span>
     <span>{t('currencyTotalApprox')} <CurrencyEstimate pesos={vista.total}/></span>
     <small>{t('currencyNotice')}</small>
   </div>}
   <p className="tax-note">{t('vatExemptionNote')}</p>
   {!vista&&seleccion.length>0&&<p className="notice warning">{t('noRates')}</p>}
   {vista&&Number(huespedes)>vista.capacidad&&<p className="notice warning">{t('invalidGuests')}</p>}
   {error&&<p className="notice error" role="alert">{error}</p>}
   {resultado&&<p className="notice success" role="status">{t('sent')}<br/>ID: {resultado.solicitudId}<br/>{t('total')}: {formatoCLP(resultado.totalCotizado)}</p>}
   <button className="btn primary block" disabled={busy||!vista||Number(huespedes)>vista.capacidad||entrada<hoyChile()}>{busy?t('sending'):t('submit')} →</button>
   {DEMO&&<p className="muted small demo-note">{t('demoSubmit')}</p>}
  </aside>
 </form></div>;
}
