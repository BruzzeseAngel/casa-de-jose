/** Moneda visual únicamente: la fuente de verdad y las solicitudes siguen en CLP.
 * Frankfurter API v2 publica tasas diarias de referencia, no tasas de pago.
 * No se almacenan conversiones ni se calculan impuestos con divisas.
 */
export const MONEDAS = Object.freeze(['CLP','USD','EUR','BRL','GBP','ARS']);
export const URL_TASAS = 'https://api.frankfurter.dev/v2/rates?base=CLP&quotes=USD,EUR,BRL,GBP,ARS';
const lenguajes = {es:'es-CL',en:'en-US',pt:'pt-BR',de:'de-DE',fr:'fr-FR'};
export function formatoDivisa(importe,moneda,idioma='es'){
  if(!Number.isFinite(importe))return '—';
  if(!MONEDAS.includes(moneda))throw Error('Divisa no soportada');
  return new Intl.NumberFormat(lenguajes[idioma]||'es-CL',{
    style:'currency',currency:moneda,minimumFractionDigits:moneda==='CLP'?0:2,
    maximumFractionDigits:moneda==='CLP'?0:2
  }).format(importe);
}
export function convertirCLP(pesos,tasa){
  if(!Number.isFinite(pesos)||pesos<0||!Number.isFinite(tasa)||tasa<=0)throw Error('Conversión inválida.');
  return pesos*tasa;
}
// Permite pruebas sin red: valida respuesta de la API y guarda fecha por moneda.
export function interpretarTasas(datos){
  if(!Array.isArray(datos))throw Error('Respuesta cambiaria inesperada.');
  const resultado={};
  for(const item of datos){
    if(item.base!=='CLP'||!MONEDAS.includes(item.quote)||item.quote==='CLP')continue;
    const tasa=Number(item.rate);
    if(!Number.isFinite(tasa)||tasa<=0||!/^\d{4}-\d{2}-\d{2}$/.test(item.date||''))continue;
    resultado[item.quote]={tasa,fecha:item.date};
  }
  if(!Object.keys(resultado).length)throw Error('No hay tipos de cambio CLP disponibles.');
  return resultado;
}
let datosCache=null, instanteCache=0, solicitudPendiente=null;
export async function consultarTasas(){
  // Cache compartida 6 h por todas las pantallas: reduce uso y tráfico.
  if(datosCache&&Date.now()-instanteCache<6*60*60*1000)return datosCache;
  if(solicitudPendiente)return solicitudPendiente;
  solicitudPendiente=(async()=>{
    const res=await fetch(URL_TASAS,{headers:{Accept:'application/json'}});
    if(!res.ok)throw Error(`Servicio cambiario no disponible (${res.status}).`);
    const tasas=interpretarTasas(await res.json());
    datosCache=tasas;instanteCache=Date.now();return tasas;
  })().finally(()=>{solicitudPendiente=null});
  return solicitudPendiente;
}
