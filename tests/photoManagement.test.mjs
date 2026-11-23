import test from 'node:test';
import assert from 'node:assert/strict';
import {fotosValidas,moverFoto,quitarFotos,mismoConjuntoDeFotos} from '../src/lib/photoManagement.mjs';

test('no cuenta URLs vacías o repetidas', () => {
  assert.deepEqual(fotosValidas(['url1','','url1','url2',null,'  ']),['url1','url2']);
});
test('mueve una foto sin borrar ni duplicar URLs', () => {
  assert.deepEqual(moverFoto(['a','b','c'],0,2),['b','c','a']);
  assert.deepEqual(moverFoto(['a','b','c'],2,0),['c','a','b']);
});
test('si el índice no existe, mantiene orden original', () => {
  assert.deepEqual(moverFoto(['a','b'],0,9),['a','b']);
});
test('quita una o varias referencias sin alterar las demás', () => {
  assert.deepEqual(quitarFotos(['a','b','c','d'],['b','d']),['a','c']);
});
test('un reordenamiento conserva el conjunto, no acepta agregados ni quitados', () => {
  assert.equal(mismoConjuntoDeFotos(['a','b','c'],['c','b','a']),true);
  assert.equal(mismoConjuntoDeFotos(['a','b','c'],['a','c']),false);
  assert.equal(mismoConjuntoDeFotos(['a','b','c'],['a','b','c','d']),false);
});
