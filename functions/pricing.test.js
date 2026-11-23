'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {noches,validarEntrada,escogerTarifa}=require('./pricing');
const good={fechaEntrada:'2027-01-15',fechaSalida:'2027-01-18',nombre:'Persona Prueba',email:'prueba@example.com',telefono:'+56 9 1234 5678',huespedes:3,estacionamientoSolicitado:false,idioma:'es',seleccion:[{habitacionId:'habitacion-1',cantidad:2}]};
test('calcula tres noches',()=>assert.equal(noches('2027-01-15','2027-01-18'),3));
test('rechaza fecha inexistente',()=>assert.throws(()=>noches('2027-02-30','2027-03-02')));
test('rechaza salida anterior a entrada',()=>assert.throws(()=>noches('2027-01-18','2027-01-15')));
test('acepta ingreso válido',()=>assert.equal(validarEntrada(good,new Date('2026-12-01')),3));
test('impide duplicar categoría',()=>assert.throws(()=>validarEntrada({...good,seleccion:[good.seleccion[0],good.seleccion[0]]},new Date('2026-12-01'))));
test('bloquea precio suministrado no afecta a validación',()=>assert.equal(validarEntrada({...good,totalCotizado:1},new Date('2026-12-01')),3));
test('elige tarifa reciente por fecha',()=>{const mk=(date,price)=>({vigente:true,precioDirecto:price,fechaInicio:{toMillis:()=>Date.parse(date+'T12:00:00Z')}});assert.equal(escogerTarifa([mk('2026-01-01',100),mk('2027-02-01',200)],'2027-01-15').precioDirecto,100)});

test('teléfono requerido en nuevas solicitudes',()=>assert.throws(()=>validarEntrada({...good,telefono:''},new Date('2026-12-01')),/Teléfono/));
test('rechaza números con pocos dígitos',()=>assert.throws(()=>validarEntrada({...good,telefono:'12345'},new Date('2026-12-01')),/Teléfono|teléfono/));

test('calcula tarifa neta más IVA 19% en el servidor',()=>{
 const {calcularImporteTarifa}=require('./pricing');
 assert.deepEqual(calcularImporteTarifa(72000,1,1,'neto'),{neto:72000,iva:13680,total:85680});
});
test('la tarifa antigua mantiene su monto final',()=>{
 const {calcularImporteTarifa}=require('./pricing');
 assert.deepEqual(calcularImporteTarifa(72000,1,1),{neto:60504,iva:11496,total:72000});
});
