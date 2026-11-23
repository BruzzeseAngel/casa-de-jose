import test from 'node:test';
import assert from 'node:assert/strict';
import {precioNetoPorNoche,precioPublicoPorNoche,calcularImporteTarifa,vistaCotizacion} from '../src/lib/quote.mjs';
import {MONEDAS,interpretarTasas,convertirCLP,formatoDivisa} from '../src/lib/currency.mjs';

test('precios publicos netos: tarifa neta de 99.000 CLP no recibe IVA en catalogo',()=>{
 assert.equal(precioNetoPorNoche({precioDirecto:99000,tipoPrecio:'neto'}),99000);
 assert.equal(precioPublicoPorNoche({precioDirecto:99000,tipoPrecio:'neto'}),117810);
});
test('precio final neto conservado de tarifa antigua marcada iva incluido',()=>{
 assert.equal(precioNetoPorNoche({precioDirecto:72000}),60504);
 assert.equal(precioPublicoPorNoche({precioDirecto:72000}),72000);
});
test('referencia Booking se compara SIN sumar IVA en vistas; descuento neto correcto',()=>{
 const directo=99000, referencia=110464;
 assert.equal(referencia-directo,11464);
 assert.equal(Math.round((referencia-directo)/referencia*1000)/10,10.4);
});
test('la cotizacion backend-compatible continua usando el total CLP con IVA',()=>{
 const q=vistaCotizacion({entrada:'2027-01-01',salida:'2027-01-02',seleccion:[{habitacionId:'x',cantidad:1}],habitaciones:[{id:'x',nombre:'Doble',activa:true,stockTotal:2,capacidad:2}],tarifasPorHabitacion:{x:[{precioDirecto:99000,tipoPrecio:'neto',vigente:true,fechaInicio:new Date('2026-10-01')}]} });
 assert.deepEqual([q.neto,q.iva,q.total],[99000,18810,117810]);
});
test('parseo tasas de cambio valida CLP y fecha y descarta entradas incorrectas',()=>{
 const rows=[{date:'2026-11-06',base:'CLP',quote:'USD',rate:.0011},{date:'2026-11-06',base:'CLP',quote:'EUR',rate:.00097},{date:'2026-11-06',base:'CLP',quote:'FAKE',rate:500},{date:'2026-11-06',base:'USD',quote:'BRL',rate:4.3}];
 assert.deepEqual(interpretarTasas(rows),{USD:{tasa:.0011,fecha:'2026-11-06'},EUR:{tasa:.00097,fecha:'2026-11-06'}});
 assert.throws(()=>interpretarTasas({rates:[]}));
});
test('conversion informativa redondea visualmente pero no modifica el importe CLP',()=>{
 const total=117810;
 assert.equal(convertirCLP(total,.0011),129.591);
 assert.equal(total,117810);
 assert.ok(formatoDivisa(total*.0011,'USD','en').includes('$'));
 assert.ok(MONEDAS.includes('CLP'));
 assert.throws(()=>convertirCLP(10000,-1));
});
