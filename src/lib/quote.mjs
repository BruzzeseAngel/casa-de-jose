// Utilidades puras: se pueden probar con `npm test` sin acceder a Firebase.
export function nochesEntre(entrada, salida) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(entrada || '') || !/^\d{4}-\d{2}-\d{2}$/.test(salida || '')) return 0;
  const a = Date.parse(entrada + 'T12:00:00.000Z');
  const b = Date.parse(salida + 'T12:00:00.000Z');
  if (!Number.isFinite(a) || !Number.isFinite(b)) return 0;
  const n = (b - a) / 86400000;
  return Number.isInteger(n) && n > 0 && n <= 60 ? n : 0;
}
export function hoyChile() {
  const parts = new Intl.DateTimeFormat('en-US',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const obj = Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return `${obj.year}-${obj.month}-${obj.day}`;
}
export function fechaTarifa(tarifa) {
  const d = tarifa?.fechaInicio;
  if (d?.toDate) return d.toDate();
  if (d instanceof Date) return d;
  if (typeof d==='string') return new Date(d);
  return new Date(0);
}
// Una tarifa se aplica desde fechaInicio; gana la vigente más reciente al ingreso.
export function seleccionarTarifa(tarifas, fechaEntrada) {
  const inicio = Date.parse(fechaEntrada+'T23:59:59Z');
  const candidates = (tarifas||[]).filter(t=>t.vigente===true && Number.isInteger(Number(t.precioDirecto)) && Number(t.precioDirecto)>0 && fechaTarifa(t).getTime()<=inicio)
    .sort((a,b)=>fechaTarifa(b)-fechaTarifa(a));
  if (candidates.length>1 && fechaTarifa(candidates[0]).getTime()===fechaTarifa(candidates[1]).getTime()) return null;
  return candidates[0]||null;
}
export function vistaCotizacion({entrada,salida,seleccion,habitaciones,tarifasPorHabitacion}) {
  const noches=nochesEntre(entrada,salida);
  if (!noches||!seleccion?.length) return null;
  const detalles=[]; let total=0, neto=0, iva=0, capacidad=0;
  for (const item of seleccion) {
    const habitacion=habitaciones.find(h=>h.id===item.habitacionId);
    if(!habitacion || !habitacion.activa || !Number.isInteger(Number(item.cantidad)) || Number(item.cantidad)<1 || Number(item.cantidad)>habitacion.stockTotal) return null;
    const tarifa=seleccionarTarifa(tarifasPorHabitacion[habitacion.id]||[],entrada);
    if(!tarifa) return null;
    // Nuevo contrato: precioDirecto es NETO si tipoPrecio='neto'.
    // Los registros antiguos sin esta marca conservan su precio FINAL anterior.
    let calculo;
    try{calculo=calcularImporteTarifa(Number(tarifa.precioDirecto),Number(item.cantidad),noches,tarifa.tipoPrecio)}
    catch{return null;}
    total+=calculo.total;neto+=calculo.neto;iva+=calculo.iva;
    capacidad+=habitacion.capacidad*Number(item.cantidad);
    detalles.push({habitacionId:habitacion.id,nombre:habitacion.nombre,cantidad:Number(item.cantidad),tarifaAplicada:Number(tarifa.precioDirecto),tipoPrecio:tarifa.tipoPrecio||'iva-incluido',subtotal:calculo.total,subtotalNeto:calculo.neto,iva:calculo.iva});
  }
  if(![total,neto,iva].every(Number.isSafeInteger))return null;
  return {noches,capacidad,total,neto,iva,detalles};
}
export const formatoCLP = valor => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(valor||0);

// Migración no destructiva: una tarifa preexistente SIN tipoPrecio conserva
// el criterio previo (IVA ya incluido) hasta que un administrador la edite.
export function desgloseIvaIncluido(total){
  if(!Number.isSafeInteger(total)||total<0)throw Error('Total CLP inválido para desglose IVA.');
  const neto=Math.round(total/1.19);
  return {neto,iva:total-neto,total,tasa:19};
}

// Para tarifas NUEVAS/EDITADAS: el precio ingresado es NETO, sin IVA.
// Se redondea a pesos chilenos por cada categoría del detalle.
export function calcularImporteTarifa(precioDirecto,cantidad=1,noches=1,tipoPrecio='iva-incluido'){
  if(!Number.isSafeInteger(precioDirecto)||precioDirecto<0 || !Number.isSafeInteger(cantidad)||cantidad<1 || !Number.isSafeInteger(noches)||noches<1) throw Error('Importe o cantidad inválidos.');
  if(!['neto','iva-incluido'].includes(tipoPrecio))throw Error('Tipo de tarifa desconocido.');
  const base=precioDirecto*cantidad*noches;
  if(!Number.isSafeInteger(base))throw Error('Importe fuera de rango.');
  if(tipoPrecio==='neto'){
    const iva=Math.round(base*19/100);
    const total=base+iva;
    if(!Number.isSafeInteger(total))throw Error('Importe fuera de rango.');
    return {neto:base,iva,total};
  }
  const {neto,iva,total}=desgloseIvaIncluido(base);
  return {neto,iva,total};
}
// Catálogo: se comparan precios NETOS (antes de IVA), no un neto con un bruto.
// Compatibilidad: las tarifas anteriores sin tipoPrecio se guardaron con IVA incluido.
export const precioNetoPorNoche=tarifa=>calcularImporteTarifa(Number(tarifa.precioDirecto),1,1,tarifa.tipoPrecio||'iva-incluido').neto;
// Cotización y pagos informativos: la Cloud Function conserva el TOTAL con IVA.
export const precioPublicoPorNoche=tarifa=>calcularImporteTarifa(Number(tarifa.precioDirecto),1,1,tarifa.tipoPrecio||'iva-incluido').total;
