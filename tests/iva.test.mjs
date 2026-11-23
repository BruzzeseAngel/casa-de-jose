import test from 'node:test';
import assert from 'node:assert/strict';
import {calcularImporteTarifa,desgloseIvaIncluido,precioPublicoPorNoche,vistaCotizacion} from '../src/lib/quote.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const backend=require('../functions/pricing.js');

test('tarifa NUEVA neta de 72.000 añade IVA 19%: 85.680 final',()=>{
  assert.deepEqual(calcularImporteTarifa(72000,1,1,'neto'),{neto:72000,iva:13680,total:85680});
});
test('dos noches con valor neto 72.000 totalizan 171.360',()=>{
  assert.deepEqual(calcularImporteTarifa(72000,1,2,'neto'),{neto:144000,iva:27360,total:171360});
});
test('tarifa histórica sin marca conserva total final de 72.000',()=>{
  assert.deepEqual(calcularImporteTarifa(72000,1,1),{neto:60504,iva:11496,total:72000});
  assert.equal(precioPublicoPorNoche({precioDirecto:72000}),72000);
});
test('editar tarifa histórica pre-carga su neto y conserva total cercano',()=>{
  const neto=desgloseIvaIncluido(72000).neto;
  assert.equal(calcularImporteTarifa(neto,1,1,'neto').total,72000);
});
test('la cotización suma bruto y desglose de tarifas netas e históricas',()=>{
  const rooms=[
    {id:'x',nombre:'Neta',activa:true,capacidad:2,stockTotal:3},
    {id:'y',nombre:'Heredada',activa:true,capacidad:2,stockTotal:3}
  ];
  const date=new Date('2026-01-01T12:00:00.000Z');
  const rate=(price,tag)=>({precioDirecto:price,tipoPrecio:tag,vigente:true,fechaInicio:date});
  const q=vistaCotizacion({entrada:'2027-01-01',salida:'2027-01-02',seleccion:[{habitacionId:'x',cantidad:1},{habitacionId:'y',cantidad:1}],habitaciones:rooms,tarifasPorHabitacion:{x:[rate(72000,'neto')],y:[rate(59000,undefined)]}});
  assert.equal(q.total,85680+59000);
  assert.equal(q.neto+q.iva,q.total);
  assert.deepEqual(q.detalles.map(r=>r.subtotal),[85680,59000]);
});
test('frontend y backend devuelven mismo cálculo para ambos esquemas',()=>{
  for(const tipo of ['neto','iva-incluido']){
    for(const p of [59000,72000,107357]){
      const x=calcularImporteTarifa(p,3,7,tipo);
      const y=backend.calcularImporteTarifa(p,3,7,tipo);
      assert.deepEqual(x,y);
    }
  }
});
test('importes inválidos son rechazados y no desbordan enteros',()=>{
  assert.throws(()=>calcularImporteTarifa(-1,1,1,'neto'));
  assert.throws(()=>calcularImporteTarifa(100,1,1,'desconocido'));
  assert.throws(()=>calcularImporteTarifa(Number.MAX_SAFE_INTEGER,4,1,'neto'));
});
