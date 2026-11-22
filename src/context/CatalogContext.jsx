import { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';
import { DEMO } from '../lib/firebase';
import { obtenerCatalogoPublico } from '../lib/catalogFirestore';
import { normalizarHabitaciones, normalizarServicios } from '../lib/catalogModel.mjs';
import { DEMO_ROOMS, DEMO_SERVICES, DEMO_RATES } from '../lib/demo';

const CatalogContext = createContext(null);
const DEMO_CATALOG = {
  rooms: normalizarHabitaciones(DEMO_ROOMS), services: normalizarServicios(DEMO_SERVICES),
  rates: DEMO_RATES, loading: false, error: '', errorTarifas: false,
};

export function CatalogProvider({ children }) {
  const [catalogo, setCatalogo] = useState(() => DEMO ? DEMO_CATALOG : {
    rooms: [], services: [], rates: {}, loading: true, error: '', errorTarifas: false,
  });
  const requestId = useRef(0);

  const recargar = useCallback(async () => {
    if (DEMO) return true;
    const id = ++requestId.current;
    setCatalogo(prev => ({ ...prev, loading: true, error: '' }));
    try {
      const datos = await obtenerCatalogoPublico();
      if (id === requestId.current) setCatalogo({ ...datos, loading: false, error: '' });
      return true;
    } catch (err) {
      console.error('No fue posible leer el catálogo público de Firestore:', err);
      if (id === requestId.current) setCatalogo({
        rooms: [], services: [], rates: {}, loading: false, error: 'catalogLoadError', errorTarifas: false,
      });
      return false;
    }
  }, []);

  useEffect(() => {
    if (DEMO) return undefined;
    recargar();
    return () => { ++requestId.current; };
  }, [recargar]);

  return <CatalogContext.Provider value={{ ...catalogo, recargar }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const contexto = useContext(CatalogContext);
  if (!contexto) throw new Error('useCatalog debe utilizarse dentro de CatalogProvider.');
  return contexto;
}
