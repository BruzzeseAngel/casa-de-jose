import test from 'node:test';
import assert from 'node:assert/strict';
import {nombreHabitacion,traducirTexto,traducirLista} from '../src/lib/contentTranslations.js';

test('seis idiomas a través de identificadores estables de habitación',()=>{
 assert.equal(nombreHabitacion({id:'doble-estandar',nombre:'Habitación Doble Estándar'},'de'),'Standard-Doppelzimmer');
 assert.equal(nombreHabitacion({id:'loft-familiar',nombre:'Loft Familiar'},'en'),'Family Loft');
});
test('comodidades conocidas quedan traducidas',()=>{
 assert.deepEqual(traducirLista(['Wi-Fi','Baño privado'],'de'),['WLAN','Eigenes Badezimmer']);
});
test('valores desconocidos mantienen texto original sin inventar traducción',()=>{
 assert.equal(traducirTexto('Servicio especial','fr'),'Servicio especial');
});
