import test from 'node:test';
import assert from 'node:assert/strict';
import {nochesEntre, seleccionarTarifa, vistaCotizacion} from '../src/lib/quote.mjs';
const room={id:'a',nombre:'Prueba',capacidad:2,stockTotal:3,activa:true};
const rate=(d,price)=>({vigente:true,fechaInicio:new Date(d+'T12:00:00Z'),precioDirecto:price});
test('2 noches entre dos fechas válidas',()=>assert.equal(nochesEntre('2026-12-01','2026-12-03'),2));
test('rechaza fechas invertidas',()=>assert.equal(nochesEntre('2026-12-04','2026-12-03'),0));
test('rechaza estadías superiores a 60 noches',()=>assert.equal(nochesEntre('2026-12-01','2027-03-01'),0));
test('tarifa más reciente aplicable a entrada',()=>assert.equal(seleccionarTarifa([rate('2026-01-01',100),rate('2026-12-15',200)],'2026-12-10').precioDirecto,100));
test('sin tarifas vigentes: no se calcula',()=>assert.equal(seleccionarTarifa([], '2026-12-10'),null));
test('total respeta cantidad, noches, tarifa y capacidad',()=>{
 const q=vistaCotizacion({entrada:'2026-12-01',salida:'2026-12-04',seleccion:[{habitacionId:'a',cantidad:2}],habitaciones:[room],tarifasPorHabitacion:{a:[rate('2026-01-01',75000)]}});
 assert.equal(q.total,450000);assert.equal(q.capacidad,4);assert.equal(q.noches,3);
});
test('rechaza cantidad superior a stock físico',()=>assert.equal(vistaCotizacion({entrada:'2026-12-01',salida:'2026-12-04',seleccion:[{habitacionId:'a',cantidad:4}],habitaciones:[room],tarifasPorHabitacion:{a:[rate('2026-01-01',75000)]}}),null));
