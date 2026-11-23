import test from 'node:test';
import assert from 'node:assert/strict';
import {ESTADOS_SOLICITUD,contarSolicitudes,filtrarSolicitudes} from '../src/lib/requestFilters.mjs';

const lista=[
 {id:'a',estado:'Pendiente'}, {id:'b',estado:'Confirmada'},
 {id:'c',estado:'Pendiente'}, {id:'d',estado:'Rechazada'},
 {id:'e',estado:'Archivada'}
];

test('Los filtros respetan los estados que usa el modelo Firestore',()=>{
 assert.deepEqual(ESTADOS_SOLICITUD,['Pendiente','Confirmada','Rechazada','Archivada']);
});
test('Todas permite ver todas las solicitudes',()=>{
 assert.equal(filtrarSolicitudes(lista,'Todas').length,5);
});
test('Filtra solo las pendientes sin modificar la lista original',()=>{
 assert.deepEqual(filtrarSolicitudes(lista,'Pendiente').map(s=>s.id),['a','c']);
 assert.equal(lista.length,5);
});
test('Confirmada, Rechazada y Archivada producen el subconjunto esperado',()=>{
 for(const estado of ['Confirmada','Rechazada','Archivada'])assert.equal(filtrarSolicitudes(lista,estado).length,1);
});
test('No devuelve registros cuando el estado es desconocido',()=>{
 assert.deepEqual(filtrarSolicitudes(lista,'Eliminada'),[]);
});
test('El contador coincide con las opciones del filtro',()=>{
 assert.deepEqual(contarSolicitudes(lista),{Todas:5,Pendiente:2,Confirmada:1,Rechazada:1,Archivada:1});
});
test('Lista vacía: ningún filtro falla y todos los conteos son cero',()=>{
 assert.deepEqual(filtrarSolicitudes([], 'Pendiente'),[]);
 assert.deepEqual(contarSolicitudes([]),{Todas:0,Pendiente:0,Confirmada:0,Rechazada:0,Archivada:0});
});
