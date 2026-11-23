// Datos de demostración; nombres y stock del informe. Precios/capacidades/superficies son FICTICIOS.
// Jamás presentar estos montos como tarifas reales del establecimiento.
export const DEMO_ROOMS = [
  ['doble-estandar','Habitación Doble Estándar',2,3,21,72000,'Cama matrimonial','Wi-Fi, Baño privado'],
  ['loft-familiar','Loft Familiar',4,3,35,145000,'Cama matrimonial, Camas individuales','Wi-Fi, Cocina equipada'],
  ['triple','Habitación Triple',3,1,27,102000,'Cama matrimonial, Cama individual','Wi-Fi, Baño privado'],
  ['doble-dos-camas','Habitación Doble - 2 camas',2,1,22,76000,'Dos camas individuales','Wi-Fi, Baño privado'],
  ['doble-pequena','Habitación Doble Pequeña',2,2,16,59000,'Cama matrimonial','Wi-Fi'],
  ['triple-superior','Habitación Triple Superior',3,1,30,118000,'Cama matrimonial, Cama individual','Wi-Fi, Baño privado, Terraza']
].map(([id,nombre,capacidad,stockTotal,tamanoM2,precioDirecto,camas,comodidades],index)=>({
  id,nombre,capacidad,stockTotal,tamanoM2,camas:camas.split(', '),comodidades:comodidades.split(', '),fotos:[],activa:true,index,
  tarifas:[{id:'demo',precioDirecto,tipoPrecio:'neto',precioReferencia:null,vigente:true,fechaInicio:new Date('2026-01-01T12:00:00Z')}]
}));

export const DEMO_SERVICES = [
  {id:'piscina',nombre:'Piscina al aire libre',categoria:'Instalaciones',modalidad:'Consultar disponibilidad',descripcion:'Espacio de descanso para huéspedes.',activo:true,emoji:'♒'},
  {id:'cuarzo',nombre:'Camas de cuarzo',categoria:'Bienestar',modalidad:'Consultar condiciones',descripcion:'Área de descanso en el establecimiento.',activo:true,emoji:'◇'},
  {id:'desayuno',nombre:'Desayuno',categoria:'Alimentación',modalidad:'Consultar condiciones',descripcion:'Servicio opcional sujeto a confirmación.',activo:true,emoji:'☕'},
  {id:'sauna',nombre:'Sauna',categoria:'Bienestar',modalidad:'Consultar disponibilidad',descripcion:'Espacio destinado a relajación.',activo:true,emoji:'♨'}
];
