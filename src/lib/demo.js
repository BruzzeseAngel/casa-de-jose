// Datos de demostración; nombres y stock del informe. Capacidades, superficies y servicios son datos ilustrativos; el stock se basa en el informe.
// No se incluyen tarifas de muestra en esta versión pública.
export const DEMO_ROOMS = [
  ['doble-estandar','Habitación Doble Estándar',2,3,21,'Cama matrimonial','Wi-Fi, Baño privado'],
  ['loft-familiar','Loft Familiar',4,3,35,'Cama matrimonial, Camas individuales','Wi-Fi, Cocina equipada'],
  ['triple','Habitación Triple',3,1,27,'Cama matrimonial, Cama individual','Wi-Fi, Baño privado'],
  ['doble-dos-camas','Habitación Doble - 2 camas',2,1,22,'Dos camas individuales','Wi-Fi, Baño privado'],
  ['doble-pequena','Habitación Doble Pequeña',2,2,16,'Cama matrimonial','Wi-Fi'],
  ['triple-superior','Habitación Triple Superior',3,1,30,'Cama matrimonial, Cama individual','Wi-Fi, Baño privado, Terraza']
].map(([id,nombre,capacidad,stockTotal,tamanoM2,camas,comodidades],index)=>({
  id,nombre,capacidad,stockTotal,tamanoM2,camas:camas.split(', '),comodidades:comodidades.split(', '),fotos:[],activa:true,index
}));


export const DEMO_SERVICES = [
  {id:'piscina',nombre:'Piscina al aire libre',categoria:'Instalaciones',modalidad:'Consultar disponibilidad',descripcion:'Espacio de descanso para huéspedes.',activo:true,emoji:'♒'},
  {id:'cuarzo',nombre:'Camas de cuarzo',categoria:'Bienestar',modalidad:'Consultar condiciones',descripcion:'Área de descanso en el establecimiento.',activo:true,emoji:'◇'},
  {id:'desayuno',nombre:'Desayuno',categoria:'Alimentación',modalidad:'Consultar condiciones',descripcion:'Servicio opcional sujeto a confirmación.',activo:true,emoji:'☕'},
  {id:'sauna',nombre:'Sauna',categoria:'Bienestar',modalidad:'Consultar disponibilidad',descripcion:'Espacio destinado a relajación.',activo:true,emoji:'♨'}
];
