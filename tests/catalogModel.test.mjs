import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizarHabitaciones, normalizarServicios, normalizarTarifas, tarifasPorId } from '../src/lib/catalogModel.mjs';

test('habitaciones solo activas y asociadas al ID real', () => {
 const datos=normalizarHabitaciones([{id:'hab1',activa:true,nombre:'Doble',capacidad:2,stockTotal:1},{id:'hab2',activa:false}]);
 assert.equal(datos.length,1);assert.equal(datos[0].id,'hab1');assert.equal(datos[0].index,0);
});
test('no reusa objetos ni muta los arreglos originales', () => {
 const h={id:'hab1',activa:true,camas:['Cama'],fotos:[]};
 const r=normalizarHabitaciones([h]);
 assert.notEqual(r[0],h);assert.deepEqual(h,{id:'hab1',activa:true,camas:['Cama'],fotos:[]});
});
test('normaliza campos de colecciones incompletas', () => {
 const h=normalizarHabitaciones([{id:'x',activa:true}])[0];
 assert.deepEqual(h.comodidades,[]);assert.deepEqual(h.fotos,[]);assert.equal(h.stockTotal,0);
});
test('ignora fotos y comodidades de tipos inesperados', () => {
 const h=normalizarHabitaciones([{id:'x',activa:true,fotos:42,comodidades:[2,'Wifi','  ']}])[0];
 assert.deepEqual(h.fotos,[]);assert.deepEqual(h.comodidades,['Wifi']);
});
test('servicios solo activos y con fotos válidas', () => {
 const r=normalizarServicios([{id:'s1',activo:true,descripcion:'Piscina',fotos:['https://x/a.jpg']},{id:'s2',activo:false}]);
 assert.equal(r.length,1);assert.equal(r[0].descripcion,'Piscina');assert.equal(r[0].fotos.length,1);
});
test('las tarifas solo incluyen las vigentes',()=>{
 assert.deepEqual(normalizarTarifas([{id:'a',vigente:true,precioDirecto:100},{id:'b',vigente:false}]),[{id:'a',vigente:true,precioDirecto:100}]);
});
test('tarifasPorId relaciona habitaciones con arreglos sin mezclar IDs',()=>{
 const habitaciones=[{id:'A'},{id:'B'}];
 const r=tarifasPorId(habitaciones,[[{vigente:true,precioDirecto:100}],[{vigente:true,precioDirecto:200}]]);
 assert.equal(r.A[0].precioDirecto,100);assert.equal(r.B[0].precioDirecto,200);
});
test('si no existe la tarifa se obtiene arreglo vacío, no ficticio',()=>{
 const r=tarifasPorId([{id:'A'}],[[]]);assert.deepEqual(r,{A:[]});
});
test('los arreglos vacíos no producen errores',()=>{
 assert.deepEqual(normalizarHabitaciones(null),[]);assert.deepEqual(normalizarServicios(undefined),[]);
 assert.deepEqual(tarifasPorId([],[]),{});
});
