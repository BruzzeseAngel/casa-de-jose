// Traducciones manuales de información del catálogo: sin APIs ni costos adicionales.
// Se mantiene en español la ficha original en Firestore; se traduce solo al mostrarla.
const roomNames = {
  'doble-estandar':['Habitación Doble Estándar','Standard Double Room','Quarto Duplo Standard','Standard-Doppelzimmer','Chambre double standard'],
  'loft-familiar':['Loft Familiar','Family Loft','Loft Familiar','Familienloft','Loft familial'],
  'triple':['Habitación Triple','Triple Room','Quarto Triplo','Dreibettzimmer','Chambre triple'],
  'doble-dos-camas':['Habitación Doble - 2 camas','Twin Room','Quarto Duplo - 2 camas','Zweibettzimmer','Chambre lits jumeaux'],
  'doble-pequena':['Habitación Doble Pequeña','Small Double Room','Quarto Duplo Pequeno','Kleines Doppelzimmer','Petite chambre double'],
  'triple-superior':['Habitación Triple Superior','Superior Triple Room','Quarto Triplo Superior','Superior-Dreibettzimmer','Chambre triple supérieure'],
};
const words = {
  'wi-fi':['Wi-Fi','Wi-Fi','Wi-Fi','WLAN','Wi-Fi'],
  'bano privado':['Baño privado','Private bathroom','Banheiro privativo','Eigenes Badezimmer','Salle de bains privée'],
  'terraza':['Terraza','Terrace','Terraço','Terrasse','Terrasse'],
  'cocina equipada':['Cocina equipada','Equipped kitchen','Cozinha equipada','Ausgestattete Küche','Cuisine équipée'],
  'cama matrimonial':['Cama matrimonial','Double bed','Cama de casal','Doppelbett','Lit double'],
  'cama individual':['Cama individual','Single bed','Cama de solteiro','Einzelbett','Lit simple'],
  'camas individuales':['Camas individuales','Single beds','Camas de solteiro','Einzelbetten','Lits simples'],
  'dos camas individuales':['Dos camas individuales','Two single beds','Duas camas de solteiro','Zwei Einzelbetten','Deux lits simples'],
  'piscina al aire libre':['Piscina al aire libre','Outdoor swimming pool','Piscina ao ar livre','Außenpool','Piscine extérieure'],
  'camas de cuarzo':['Camas de cuarzo','Quartz beds','Camas de quartzo','Quarzliegen','Lits de quartz'],
  'desayuno':['Desayuno','Breakfast','Café da manhã','Frühstück','Petit-déjeuner'],
  'sauna':['Sauna','Sauna','Sauna','Sauna','Sauna'],
  'instalaciones':['Instalaciones','Facilities','Instalações','Einrichtungen','Installations'],
  'bienestar':['Bienestar','Wellness','Bem-estar','Wellness','Bien-être'],
  'alimentacion':['Alimentación','Dining','Alimentação','Verpflegung','Restauration'],
  'consultar disponibilidad':['Consultar disponibilidad','Ask about availability','Consultar disponibilidade','Verfügbarkeit anfragen','Disponibilité sur demande'],
  'consultar condiciones':['Consultar condiciones','Ask about conditions','Consultar condições','Bedingungen erfragen','Conditions sur demande'],
  'espacio de descanso para huespedes.':['Espacio de descanso para huéspedes.','Guest relaxation area.','Área de descanso para hóspedes.','Ruhebereich für Gäste.','Espace de détente pour les hôtes.'],
  'area de descanso en el establecimiento.':['Área de descanso en el establecimiento.','Relaxation area at the property.','Área de relaxamento no alojamento.','Ruhebereich in der Unterkunft.','Espace de repos sur place.'],
  'servicio opcional sujeto a confirmacion.':['Servicio opcional sujeto a confirmación.','Optional service subject to confirmation.','Serviço opcional sujeito a confirmação.','Optionaler Service nach Bestätigung.','Service facultatif soumis à confirmation.'],
  'espacio destinado a relajacion.':['Espacio destinado a relajación.','Space dedicated to relaxation.','Espaço dedicado ao relaxamento.','Bereich zur Entspannung.','Espace dédié à la détente.'],
};
const langs=['es','en','pt','de','fr'];
const norm=s=>String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const idx=lang=>Math.max(0,langs.indexOf(lang));

/** Los nombres de las seis categorías usan su ID estable, no un traductor automático. */
export function nombreHabitacion(room,lang){
  if(!room)return '';
  const source=roomNames[room.id];
  return source?.[idx(lang)] || room.nombre || '';
}
/** La información no prevista en el diccionario se conserva en su idioma original. */
export function traducirTexto(value,lang){return words[norm(value)]?.[idx(lang)]||value||'';}
export function traducirLista(values,lang){return (values||[]).map(item=>traducirTexto(item,lang));}
