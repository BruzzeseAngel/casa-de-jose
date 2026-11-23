/**
 * Utilidades puras para administrar fotos; una foto se identifica por su URL.
 * Nunca modifican archivos por sí mismas. La persistencia queda en data.js.
 */
export function fotosValidas(fotos) {
  return Array.isArray(fotos) ? [...new Set(fotos.filter(x => typeof x === 'string' && x.trim()))] : [];
}

export function moverFoto(fotos, indice, destino) {
  const lista = fotosValidas(fotos);
  if (!Number.isInteger(indice) || !Number.isInteger(destino) ||
      indice < 0 || destino < 0 || indice >= lista.length || destino >= lista.length) return lista;
  const [foto] = lista.splice(indice, 1);
  lista.splice(destino, 0, foto);
  return lista;
}

export function quitarFotos(fotos, eliminadas) {
  const removidas = new Set(eliminadas);
  return fotosValidas(fotos).filter(url => !removidas.has(url));
}

// Evita que se sobrescriba un arreglo actualizado por otra sesión durante un reordenamiento.
export function mismoConjuntoDeFotos(antes, despues) {
  const a = fotosValidas(antes).sort();
  const b = fotosValidas(despues).sort();
  return a.length === b.length && a.every((url, i) => url === b[i]);
}
