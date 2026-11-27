import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  obtenerHabitaciones,
  obtenerTarifas,
  obtenerServicios,
  obtenerSolicitudesAdmin,
  obtenerHistorial,
  guardarHabitacion,
  eliminarHabitacion,
  restaurarHabitacion,
  guardarTarifa,
  actualizarSolicitud,
  guardarServicio,
  crearServicio,
  subirFoto,
  subirFotoServicio,
  eliminarServicio,
  eliminarFotoServicio,
  eliminarFotoHabitacion,
  limpiarReferenciasFotos,
  guardarOrdenFotos,
  obtenerConfiguracionPortada,
  guardarConfiguracionPortada,
  subirFotoPortada,
  eliminarFotoPortada
} from '../lib/data';
import { formatoCLP, hoyChile, desgloseIvaIncluido, calcularImporteTarifa } from '../lib/quote.mjs';
import { ESTADOS_SOLICITUD, contarSolicitudes, filtrarSolicitudes } from '../lib/requestFilters.mjs';
import { moverFoto, quitarFotos } from '../lib/photoManagement.mjs';
import PhotoManager from '../components/PhotoManager';
const ROOM_INITIAL = {
  nombre: '',
  capacidad: '2',
  stockTotal: '1',
  tamanoM2: '20',
  camas: '',
  comodidades: '',
  fotos: [],
  activa: true
};
const RATE_INITIAL = { tarifaId: '', precioDirecto: '', precioReferencia: '', fechaInicio: hoyChile(), vigente: true };
const STATES = ESTADOS_SOLICITUD;
// Los valores guardados en Firestore no se traducen: son parte del modelo de datos.
const ETIQUETAS_FILTRO = {
  Todas: 'Todas',
  Pendiente: 'Pendientes',
  Confirmada: 'Confirmadas',
  Rechazada: 'Rechazadas',
  Archivada: 'Archivadas'
};
const toDate = v => v?.toDate ? v.toDate().toISOString().slice(0, 10) : new Date(v || Date.now()).toISOString().slice(0, 10);
const split = s => s.split(',').map(x => x.trim()).filter(Boolean);
// El panel separa los tres CRUD exigidos (habitaciones, tarifas, solicitudes).
// Servicios y fotografías son funcionalidades complementarias a los tres CRUD principales.
export default function Admin() {
  const { user } = useAuth(), { t } = useLanguage();
  const [tab, setTab] = useState('resumen'), [busy, setBusy] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [habitaciones, setHabitaciones] = useState([]), [solicitudes, setSolicitudes] = useState([]), [servicios, setServicios] = useState([]);
  const [roomId, setRoomId] = useState(null), [room, setRoom] = useState({ ...ROOM_INITIAL }), [photo, setPhoto] = useState([]);
  const [rateRoom, setRateRoom] = useState(''), [tarifas, setTarifas] = useState([]), [rate, setRate] = useState({ ...RATE_INITIAL }), [legacyEdit, setLegacyEdit] = useState(false);
  // Solo filtra la presentación; no cambia estados ni escribe documentos en Firestore.
  const [filtroSolicitudes, setFiltroSolicitudes] = useState('Todas');
  const conteoSolicitudes = useMemo(() => contarSolicitudes(solicitudes), [solicitudes]);
  const solicitudesFiltradas = useMemo(() => filtrarSolicitudes(solicitudes, filtroSolicitudes), [solicitudes, filtroSolicitudes]);
  const [showServiceForm, setShowServiceForm] = useState(false), [editingServiceId, setEditingServiceId] = useState(null), [servicePhotos, setServicePhotos] = useState([]);
  const [portada, setPortada] = useState({ fotos: [], incluirFotosServicios: true }), [portadaFiles, setPortadaFiles] = useState([]);
  const SERVICE_INITIAL = {
    nombre: '',
    categoria: 'Instalaciones',
    modalidad: 'Consultar disponibilidad',
    descripcion: '',
    activo: true,
    mostrarPortada: false,
    fotos: []
  };
  const [newService, setNewService] = useState({ ...SERVICE_INITIAL });
  // Recarga los datos visibles del panel después de las operaciones administrativas.
  async function reload() {
    const [h, s, v, p] = await Promise.all([obtenerHabitaciones(true), obtenerSolicitudesAdmin(), obtenerServicios(true), obtenerConfiguracionPortada()]);
    setHabitaciones(h);
    setSolicitudes(s.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    setServicios(v);
    setPortada(p);
  }
  useEffect(() => {
    let alive = true;
    Promise.all([obtenerHabitaciones(true), obtenerSolicitudesAdmin(), obtenerServicios(true), obtenerConfiguracionPortada()]).then(([h, s, v, p]) => {
      if (alive) {
        setHabitaciones(h);
        setSolicitudes(s.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        setServicios(v);
        setPortada(p);
      }
    }).catch(e => {
      if (alive)
        setError(e.message);
    });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    let alive = true;
    if (!rateRoom) {
      setTarifas([]);
      return;
    }
    obtenerTarifas(rateRoom).then(rows => {
      if (alive)
        setTarifas(rows);
    }).catch(e => {
      if (alive)
        setError(e.message);
    });
    return () => {
      alive = false;
    };
  }, [rateRoom]);
  // Centraliza el estado de carga, los mensajes de éxito y los errores de las operaciones.
  async function work(fn, success = 'Cambios guardados correctamente.') {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await fn();
      setMessage(result?.advertencia || success);
      await reload();
    }
    catch (e) {
      setError(e?.message || String(e));
    }
    finally {
      setBusy(false);
    }
  }
  function editRoom(h) {
    setRoomId(h.id);
    setRoom({ ...h, camas: (h.camas || []).join(', '), comodidades: (h.comodidades || []).join(', ') });
    setPhoto([]);
    setTab('habitaciones');
    window.scrollTo(0, 0);
  }
  // RF-07: el botón «Eliminar» hace una eliminación LÓGICA (activa=false).
  // El confirm nativo evita cambios accidentales; los históricos y fotos se conservan.
  async function removeRoom(h) {
    if (!h.activa || busy)
      return;
    const confirmado = window.confirm(`¿Eliminar la categoría «${h.nombre}» del catálogo público?\n\n` +
      'Dejará de mostrarse en Habitaciones y Cotizar.\n' +
      'NO se borrarán sus tarifas, fotos ni solicitudes anteriores.\n' +
      'Podrás restaurarla desde Administración → Habitaciones.');
    if (!confirmado)
      return;
    await work(async () => {
      await eliminarHabitacion(h.id);
      // Si editábamos esa misma categoría, limpiamos el formulario para que
      // una edición pendiente no vuelva a publicarla por accidente.
      if (roomId === h.id) {
        setRoomId(null);
        setRoom({ ...ROOM_INITIAL });
        setPhoto([]);
      }
    }, `«${h.nombre}» eliminada del catálogo. Puedes restaurarla cuando quieras.`);
  }
  async function restoreRoom(h) {
    if (h.activa || busy)
      return;
    await work(() => restaurarHabitacion(h.id), `«${h.nombre}» restaurada en el catálogo.`);
  }
  async function saveRoom(e) {
    e.preventDefault();
    await work(async () => {
      const capacidad = Number(room.capacidad), stockTotal = Number(room.stockTotal), tamanoM2 = Number(room.tamanoM2);
      if (!Number.isInteger(capacidad) || capacidad < 1 || !Number.isInteger(stockTotal) || stockTotal < 1 || !Number.isFinite(tamanoM2) || tamanoM2 <= 0)
        throw Error('Capacidad, stock y superficie deben ser valores válidos y positivos.');
      const payload = {
        nombre: room.nombre.trim(),
        capacidad,
        stockTotal,
        tamanoM2,
        camas: split(room.camas),
        comodidades: split(room.comodidades),
        fotos: room.fotos || [],
        activa: Boolean(room.activa)
      };
      if (!payload.nombre || !payload.camas.length)
        throw Error('Nombre y camas son obligatorios.');
      const id = await guardarHabitacion(payload, roomId);
      // Permite subir varias imágenes (por ejemplo, tres por habitación).
      // Si una subida falla, las anteriores ya guardadas permanecen intactas.
      const urls = [...payload.fotos];
      for (const file of photo) {
        const url = await subirFoto(id, file);
        urls.push(url);
        await guardarHabitacion({ fotos: [...urls] }, id);
      }
      setRoomId(null);
      setRoom({ ...ROOM_INITIAL });
      setPhoto([]);
    });
  }
  // Las fotos se gestionan sin volver a guardar todos los demás campos.
  // Esta operación arregla también el caso de archivos borrados manualmente en Storage.
  async function eliminarImagenHabitacion(url) {
    if (!roomId)
      return;
    await work(async () => {
      const resultado = await eliminarFotoHabitacion(roomId, url);
      setRoom(prev => ({ ...prev, fotos: quitarFotos(prev.fotos, [url]) }));
      return resultado;
    }, 'Fotografía quitada de la habitación y de su contador.');
  }
  async function reordenarImagenHabitacion(origen, destino) {
    if (!roomId)
      return;
    const nuevoOrden = moverFoto(room.fotos, origen, destino);
    await work(async () => {
      await guardarOrdenFotos('habitaciones', roomId, nuevoOrden);
      setRoom(prev => ({ ...prev, fotos: nuevoOrden }));
    }, 'Orden de fotografías actualizado.');
  }
  async function limpiarFotosHabitacion(urls) {
    if (!roomId)
      return;
    await work(async () => {
      await limpiarReferenciasFotos('habitaciones', roomId, urls);
      setRoom(prev => ({ ...prev, fotos: quitarFotos(prev.fotos, urls) }));
    }, 'Enlaces rotos retirados de Firestore.');
  }
  // Elegir otra habitación limpia la edición anterior para no guardar una
  // tarifa de una categoría en el documento de otra categoría.
  function seleccionarHabitacionTarifa(id) {
    if (id === rateRoom)
      return;
    setRateRoom(id);
    setTarifas([]);
    setRate({ ...RATE_INITIAL });
    setLegacyEdit(false);
  }
  function editRate(r) {
    // Registro antiguo: precioDirecto era FINAL. Lo convertimos sólo en el
    // formulario a NETO para no añadir otro 19 % al guardarlo sin ajustes.
    const esAntiguo = r.tipoPrecio !== 'neto';
    const precioNeto = esAntiguo ? desgloseIvaIncluido(Number(r.precioDirecto)).neto : r.precioDirecto;
    setLegacyEdit(esAntiguo);
    setRate({
      tarifaId: r.id,
      precioDirecto: String(precioNeto),
      precioReferencia: r.precioReferencia == null ? '' : String(r.precioReferencia),
      fechaInicio: toDate(r.fechaInicio),
      vigente: r.vigente
    });
    window.scrollTo(0, 0);
  }
  // La tarifa se guarda mediante la capa de datos, que invoca la función protegida.
  async function saveRate(e) {
    e.preventDefault();
    await work(async () => {
      if (!rateRoom)
        throw Error('Selecciona una categoría de habitación.');
      await guardarTarifa({
        habitacionId: rateRoom,
        tarifaId: rate.tarifaId || null,
        precioDirecto: Number(rate.precioDirecto),
        precioReferencia: rate.precioReferencia === '' ? null : Number(rate.precioReferencia),
        fechaInicio: rate.fechaInicio,
        vigente: Boolean(rate.vigente),
        tipoPrecio: 'neto'
      });
      setTarifas(await obtenerTarifas(rateRoom));
      setRate({ ...RATE_INITIAL });
      setLegacyEdit(false);
    });
  }
  async function disableRate(r) {
    await work(async () => {
      // IMPORTANTE: activar/desactivar una tarifa antigua NO debe cambiar su precio.
      await guardarTarifa({
        habitacionId: rateRoom,
        tarifaId: r.id,
        precioDirecto: Number(r.precioDirecto),
        precioReferencia: r.precioReferencia ?? null,
        fechaInicio: toDate(r.fechaInicio),
        vigente: !r.vigente,
        tipoPrecio: r.tipoPrecio || 'iva-incluido'
      });
      setTarifas(await obtenerTarifas(rateRoom));
    });
  }
  // Alta/edición de servicios y carga de fotografías: misma colección del informe.
  function resetService() {
    setNewService({ ...SERVICE_INITIAL });
    setEditingServiceId(null);
    setServicePhotos([]);
    setShowServiceForm(false);
  }
  function editService(servicio) {
    setEditingServiceId(servicio.id);
    setNewService({ ...SERVICE_INITIAL, ...servicio, fotos: [...(servicio.fotos || [])] });
    setServicePhotos([]);
    setShowServiceForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function saveService(e) {
    e.preventDefault();
    await work(async () => {
      // Validamos ANTES de crear un documento, para evitar servicios vacíos si
      // el usuario selecciona más fotos de las permitidas.
      if ((newService.fotos?.length || 0) + servicePhotos.length > 12)
        throw Error('Máximo 12 fotografías por servicio.');
      for (const file of servicePhotos) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size >= 5 * 1024 * 1024)
          throw Error('Fotografía no permitida (JPG/PNG/WebP, menor de 5 MB).');
      }
      let id = editingServiceId;
      const info = {
        nombre: newService.nombre,
        categoria: newService.categoria,
        modalidad: newService.modalidad,
        descripcion: newService.descripcion,
        activo: newService.activo,
        mostrarPortada: newService.mostrarPortada
      };
      if (id) {
        await guardarServicio(id, info);
      }
      else {
        id = await crearServicio(info);
      }
      const fotos = [...(newService.fotos || [])];
      // Cada URL se registra a medida que se sube, evitando perder fotos exitosas.
      for (const archivo of servicePhotos) {
        const url = await subirFotoServicio(id, archivo);
        fotos.push(url);
        await guardarServicio(id, { fotos: [...fotos] });
      }
      resetService();
    }, editingServiceId ? 'Servicio actualizado.' : 'Servicio agregado correctamente.');
  }
  async function removeServicePhoto(url) {
    if (!editingServiceId)
      return;
    await work(async () => {
      const resultado = await eliminarFotoServicio(editingServiceId, url);
      setNewService(prev => ({ ...prev, fotos: quitarFotos(prev.fotos, [url]) }));
      return resultado;
    }, 'Fotografía quitada del servicio.');
  }
  async function reorderServicePhotos(origen, destino) {
    if (!editingServiceId)
      return;
    const nuevoOrden = moverFoto(newService.fotos, origen, destino);
    await work(async () => {
      await guardarOrdenFotos('servicios', editingServiceId, nuevoOrden);
      setNewService(prev => ({ ...prev, fotos: nuevoOrden }));
    }, 'Orden de fotografías actualizado.');
  }
  async function cleanServicePhotos(urls) {
    if (!editingServiceId)
      return;
    await work(async () => {
      await limpiarReferenciasFotos('servicios', editingServiceId, urls);
      setNewService(prev => ({ ...prev, fotos: quitarFotos(prev.fotos, urls) }));
    }, 'Enlaces rotos retirados del servicio.');
  }
  async function removeService(servicio) {
    if (!window.confirm(`Eliminar definitivamente «${servicio.nombre}»? No podrás deshacer esta acción.`))
      return;
    await work(async () => {
      const result = await eliminarServicio(servicio);
      if (result.fallosFotos)
        console.warn('Revisa imágenes huérfanas en Storage:', result.fallosFotos);
      if (editingServiceId === servicio.id)
        resetService();
    }, 'Servicio eliminado de Firestore.');
  }
  // Portada: colección técnica /configuracion/portada, independiente de habitaciones y servicios.
  async function saveCover(e) {
    e.preventDefault();
    await work(async () => {
      if (portada.fotos.length + portadaFiles.length > 12)
        throw Error('Máximo 12 fotografías propias de portada.');
      // Al guardar por primera vez se crea /configuracion/portada con AMBOS campos,
      // requisito de las reglas de Firestore para evitar documentos incompletos.
      await guardarConfiguracionPortada({ fotos: [...portada.fotos], incluirFotosServicios: Boolean(portada.incluirFotosServicios) });
      const urls = [...portada.fotos];
      for (const archivo of [...portadaFiles]) {
        const url = await subirFotoPortada(archivo);
        urls.push(url);
        await guardarConfiguracionPortada({ fotos: [...urls] });
        // Si alguna subida posterior falla, no volveremos a subir las que salieron bien.
        setPortada(prev => ({ ...prev, fotos: [...urls] }));
        setPortadaFiles(prev => prev.filter(f => f !== archivo));
      }
    }, 'Portada guardada. Actualiza la página de inicio para ver las fotos.');
  }
  async function removeCoverPhoto(url) {
    await work(() => eliminarFotoPortada(url), 'Fotografía eliminada de la portada.');
  }
  async function reorderCoverPhotos(origen, destino) {
    const nuevoOrden = moverFoto(portada.fotos, origen, destino);
    await work(() => guardarOrdenFotos('portada', null, nuevoOrden), 'Orden de la portada actualizado.');
  }
  async function cleanCoverPhotos(urls) {
    await work(() => limpiarReferenciasFotos('portada', null, urls), 'Enlaces rotos eliminados de portada.');
  }
  const labels = [['resumen', t('summary')], ['solicitudes', t('requestList')], ['habitaciones', t('roomList')], ['tarifas', t('rateList')], ['servicios', t('serviceList')], ['portada', 'Portada']];
  return <div className="admin-layout">
    <aside className="admin-sidebar">
      <strong className="admin-brand">CASA DE JOSÉ</strong>
      <small>Panel de administración</small>
      <nav aria-label="Secciones de administración">
        {labels.map(([key, label]) => <button type="button" key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>)}
      </nav>
      <Link to="/">← Volver al sitio</Link>
    </aside>
    <div className="admin-content">
      <div className="admin-top">
        <div>
          <p className="overline">GESTIÓN INTERNA · HOSTAL</p>
          <h1>{t('adminPanel')}</h1>
          <p className="muted">Bienvenido · {user?.email}</p>
        </div>
        <span className="admin-chip">Administrador</span>
      </div>
      {error && <p role="alert" className="notice error">{error}</p>}
      {message && <p role="status" className="notice success">{message}</p>}
      {tab === 'resumen' && <>
        <div className="stats-grid">
          <div className="stat">
            <span>Solicitudes pendientes</span>
            <strong>{solicitudes.filter(s => s.estado === 'Pendiente').length}</strong>
          </div>
          <div className="stat">
            <span>Categorías activas</span>
            <strong>{habitaciones.filter(h => h.activa).length}</strong>
          </div>
          <div className="stat">
            <span>Servicios activos</span>
            <strong>{servicios.filter(s => s.activo).length}</strong>
          </div>
        </div>
        <div className="form-panel">
          <h2>Proceso de atención</h2>
          <p>1. Revisar solicitudes. 2. Comprobar disponibilidad manualmente en Booking. 3. Confirmar o rechazar desde el panel. 4. El sistema registra el historial del cambio.</p>
          <div className="admin-actions">
            <button className="btn primary" onClick={() => setTab('solicitudes')}>Revisar solicitudes →</button>
            <Link className="btn secondary" to="/cotizar">Crear nueva solicitud</Link>
          </div>
        </div>
      </>}
      {tab === 'habitaciones' && <>
        <div className="admin-page-head">
          <h2>Gestión de habitaciones</h2>
          <p>Formulario CRUD · Seis categorías de alojamiento según informe.</p>
        </div>
        <form className="form-panel stack" onSubmit={saveRoom}>
          <h3>{roomId ? 'Editar categoría' : 'Nueva categoría'}</h3>
          <div className="form-grid">
            <label className="field">Nombre de la categoría<input required value={room.nombre} onChange={e => setRoom({ ...room, nombre: e.target.value })} /></label>
            <label className="field">Capacidad (personas por unidad)<input
              type="number"
              required
              min="1"
              value={room.capacidad}
              onChange={e => setRoom({ ...room, capacidad: e.target.value })}
            /></label>
            <label className="field">stockTotal (unidades físicas)<input
              type="number"
              required
              min="1"
              value={room.stockTotal}
              onChange={e => setRoom({ ...room, stockTotal: e.target.value })}
            /></label>
            <label className="field">Tamaño (m²)<input
              type="number"
              required
              min="0.1"
              step="0.1"
              value={room.tamanoM2}
              onChange={e => setRoom({ ...room, tamanoM2: e.target.value })}
            /></label>
            <label className="field">Camas (separadas por comas)<input
              required
              value={room.camas}
              onChange={e => setRoom({ ...room, camas: e.target.value })}
              placeholder="Cama matrimonial, Cama individual"
            /></label>
            <label className="field">Comodidades (separadas por comas)<input
              value={room.comodidades}
              onChange={e => setRoom({ ...room, comodidades: e.target.value })}
              placeholder="Wi-Fi, Baño privado"
            /></label>
            <div className="form-wide">
              <PhotoManager
                titulo={`Fotografías de ${room.nombre || 'la habitación'}`}
                fotos={room.fotos}
                pendientes={photo}
                onFilesChange={setPhoto}
                busy={busy}
                nuevo={!roomId}
                onEliminar={eliminarImagenHabitacion}
                onReordenar={reordenarImagenHabitacion}
                onLimpiarRotas={limpiarFotosHabitacion}
              />
            </div>
            <label className="checkbox-line"><input
              type="checkbox"
              checked={room.activa}
              onChange={e => setRoom({ ...room, activa: e.target.checked })}
            /> Publicar categoría activa</label>
          </div>
          <div className="admin-actions">
            <button className="btn primary" disabled={busy}>{roomId ? 'Guardar cambios' : 'Crear habitación'}</button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => {
                setRoomId(null);
                setRoom({ ...ROOM_INITIAL });
                setPhoto([]);
              }}
            >Limpiar formulario</button>
          </div>
        </form>
        <div className="form-panel">
          <h3>Listado de categorías</h3>
          <p className="muted small">«Eliminar» retira una categoría del sitio sin borrar sus datos históricos ni fotografías. Puedes recuperarla con «Restaurar».</p>
          <div className="admin-list">
            {habitaciones.map(h => <div className={`admin-list-row${h.activa ? '' : ' room-inactive'}`} key={h.id}>
              <div><strong>{h.nombre}</strong> <span className={`room-status-chip ${h.activa ? 'is-active' : 'is-inactive'}`}>{h.activa ? 'Activa' : 'Eliminada del catálogo'}</span>
                <p>{h.stockTotal} unidades · {h.capacidad} huéspedes · {h.tamanoM2} m²</p></div>
              <div className="admin-actions">
                <button type="button" className="btn small" disabled={busy} onClick={() => editRoom(h)}>{t('edit')}</button>
                {h.activa
                  ? <button
                    type="button"
                    className="btn small danger-outline"
                    disabled={busy}
                    onClick={() => removeRoom(h)}
                    aria-label={`Eliminar ${h.nombre} del catálogo`}
                  >Eliminar</button>
                  : <button
                    type="button"
                    className="btn small secondary"
                    disabled={busy}
                    onClick={() => restoreRoom(h)}
                    aria-label={`Restaurar ${h.nombre} en el catálogo`}
                  >Restaurar</button>}
              </div>
            </div>)}
          </div>
        </div>
      </>}
      {tab === 'tarifas' && <>
        <div className="admin-page-head">
          <h2>Gestión de tarifas</h2>
          <p>Las tarifas se asocian a cada categoría mediante la subcolección /tarifas.</p>
        </div>
        <div className="form-panel">
          <h3 id="titulo-selector-tarifa">Selecciona una categoría de habitación</h3>
          <p className="muted small">Ahora puedes reconocer la categoría por su fotografía. La elección no modifica ninguna tarifa hasta que pulses «Guardar tarifa».</p>
          {/* Selector visual: reutiliza la primera fotografía almacenada en habitaciones/{id}.fotos[].
                Es la misma colección que consulta el cotizador; no duplica imágenes ni datos. */}
          <div className="admin-rate-room-grid" role="group" aria-labelledby="titulo-selector-tarifa">
            {habitaciones.map(h => {
              const seleccionada = rateRoom === h.id;
              return <button
                key={h.id}
                type="button"
                className={`admin-rate-room-card${seleccionada ? ' is-selected' : ''}`}
                aria-pressed={seleccionada}
                disabled={busy}
                onClick={() => seleccionarHabitacionTarifa(h.id)}
              >
                <span className="admin-rate-room-image">
                  {h.fotos?.[0] ?
                    <img src={h.fotos[0]} alt="" loading="lazy" /> :
                    <span className="admin-rate-room-image-empty" aria-hidden="true">◇</span>}
                </span>
                <span className="admin-rate-room-meta">
                  <strong>{h.nombre}</strong>
                  <small>{h.capacidad} huéspedes · {h.stockTotal} unidades</small>
                  {!h.activa && <small className="admin-rate-inactive">Categoría inactiva</small>}
                </span>
                <span className="admin-rate-room-check" aria-hidden="true">{seleccionada ? '✓' : '+'}</span>
              </button>;
            })}
          </div>
          {!rateRoom && <p className="muted small" role="status">Selecciona una tarjeta para crear o editar sus tarifas.</p>}
        </div>
        {rateRoom && <>
          <form onSubmit={saveRate} className="form-panel stack">
            <h3>{rate.tarifaId ? 'Editar tarifa' : 'Nueva tarifa'}</h3>
            <div className="form-grid">
              <label className="field">Precio directo NETO (CLP por noche, SIN IVA)<input
                required
                type="number"
                min="1"
                step="1"
                value={rate.precioDirecto}
                onChange={e => setRate({ ...rate, precioDirecto: e.target.value })}
              /></label>
              <label className="field">Precio referencia Booking NETO (CLP, sin IVA; solo si comprobado)<input
                type="number"
                min="1"
                step="1"
                value={rate.precioReferencia}
                onChange={e => setRate({ ...rate, precioReferencia: e.target.value })}
              /></label>
              <label className="field">Fecha de inicio<input
                required
                type="date"
                value={rate.fechaInicio}
                onChange={e => setRate({ ...rate, fechaInicio: e.target.value })}
              /></label>
              <label className="checkbox-line"><input
                type="checkbox"
                checked={rate.vigente}
                onChange={e => setRate({ ...rate, vigente: e.target.checked })}
              /> Registro vigente</label>
            </div>
            {Number.isSafeInteger(Number(rate.precioDirecto)) && Number(rate.precioDirecto) > 0 &&
              <p className="notice soft small" role="status">
                Vista previa por noche: neto {formatoCLP(Number(rate.precioDirecto))} + IVA 19 % {formatoCLP(calcularImporteTarifa(Number(rate.precioDirecto), 1, 1, 'neto').iva)} = <strong>
                  {formatoCLP(calcularImporteTarifa(Number(rate.precioDirecto), 1, 1, 'neto').total)}
                </strong> (precio final).
              </p>}
            {legacyEdit && <p className="notice warning">Esta tarifa se guardó anteriormente con IVA incluido. El campo se precargó con su NETO estimado para mantener un total similar al anterior. Revisa el valor antes de guardar.</p>}
            <p className="notice soft small">Ingresa el precio NETO: la cotización añadirá el 19 % de IVA al total. Las tarifas antiguas siguen conservando sus importes finales hasta que las edites. El precio de referencia de Booking debe ser NETO, sin IVA, y estar verificado para la misma habitación, fechas y condiciones. Revisa las referencias que hayas guardado antes de este cambio: podrían corresponder a valores finales con impuestos. No se agregará ni descontará IVA automáticamente a la referencia. Confirma la política comercial antes de publicar precios reales.</p>
            <div className="admin-actions">
              <button disabled={busy} className="btn primary">Guardar tarifa</button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  setRate({ ...RATE_INITIAL });
                  setLegacyEdit(false);
                }}
              >Limpiar</button>
            </div>
          </form>
          <div className="form-panel">
            <h3>Tarifas de la categoría</h3>
            <div className="admin-list">
              {tarifas.map(r => <div key={r.id} className="admin-list-row">
                <div>
                  <strong>{formatoCLP(calcularImporteTarifa(r.precioDirecto, 1, 1, r.tipoPrecio || 'iva-incluido').total)} por noche (total con IVA)</strong>
                  <p>Neto: {formatoCLP(calcularImporteTarifa(r.precioDirecto, 1, 1, r.tipoPrecio || 'iva-incluido').neto)} · IVA: {formatoCLP(calcularImporteTarifa(r.precioDirecto, 1, 1, r.tipoPrecio || 'iva-incluido').iva)}</p>
                  <p>Desde {toDate(r.fechaInicio)} · {r.vigente ? 'Vigente' : 'Desactivada'} · {r.tipoPrecio === 'neto' ? 'Precio ingresado neto' : 'Tarifa histórica (IVA incluido)'}</p>
                </div>
                <div className="admin-actions">
                  <button type="button" className="btn small" onClick={() => editRate(r)}>Editar</button>
                  <button
                    type="button"
                    className="btn small secondary"
                    disabled={busy}
                    onClick={() => disableRate(r)}
                  >{r.vigente ? 'Desactivar' : 'Activar'}</button>
                </div>
              </div>)}
              {tarifas.length === 0 && <p>Sin tarifas registradas.</p>}
            </div>
          </div>
        </>}
      </>}
      {tab === 'solicitudes' && <>
        <div className="admin-page-head">
          <h2>Gestión de solicitudes</h2>
          <p>El cambio de estado requiere autorización y queda registrado en /historial.</p>
          <Link className="btn secondary" to="/cotizar">+ Crear solicitud</Link>
        </div>
        {/* Filtros locales: usamos los estados exactos del informe y mostramos su cantidad.
                No necesitamos consultas nuevas, índices adicionales ni modificaciones en Cloud Functions. */}
        <section className="admin-request-filter" aria-label="Filtrar solicitudes por estado">
          <div className="admin-request-filter-head">
            <strong>Filtrar por estado</strong>
            <span aria-live="polite">Mostrando {solicitudesFiltradas.length} de {solicitudes.length} solicitudes</span>
          </div>
          <div className="admin-request-filter-options" role="group" aria-label="Estado de la solicitud">
            {['Todas', ...STATES].map(estado => <button
              key={estado}
              type="button"
              className={`request-filter-option${filtroSolicitudes === estado ? ' is-active' : ''}`}
              aria-pressed={filtroSolicitudes === estado}
              onClick={() => setFiltroSolicitudes(estado)}
            >
              {ETIQUETAS_FILTRO[estado]} <span className="request-filter-count">{conteoSolicitudes[estado]}</span>
            </button>)}
          </div>
        </section>
        <div className="admin-request-list">
          {solicitudes.length === 0 ? <div className="form-panel">No hay solicitudes recibidas.</div> :
            solicitudesFiltradas.length === 0 ? <div className="form-panel request-filter-empty">
              <p>No hay solicitudes en el estado «{ETIQUETAS_FILTRO[filtroSolicitudes]}».</p>
              <button type="button" className="btn secondary small" onClick={() => setFiltroSolicitudes('Todas')}>Mostrar todas</button>
            </div> :
              solicitudesFiltradas.map(s => <RequestAdmin
                key={s.id}
                solicitud={s}
                onSave={async (data) => work(() => actualizarSolicitud({ solicitudId: s.id, ...data }))}
                busy={busy}
              />)}
        </div>
      </>}
      {tab === 'servicios' && <>
        <div className="admin-page-head between">
          <div>
            <h2>Servicios e instalaciones</h2>
            <p>CU-09 ampliado: publicar, editar, agregar y eliminar servicios. Las imágenes de espacios comunes pueden mostrarse en la portada.</p>
          </div>
          <button
            className="btn primary small"
            type="button"
            onClick={() => {
              if (showServiceForm)
                resetService();
              else {
                resetService();
                setShowServiceForm(true);
              }
            }}
          >{showServiceForm ? 'Cerrar formulario' : '+ Agregar servicio'}</button>
        </div>
        {showServiceForm && <form className="form-panel stack" onSubmit={saveService}>
          <h3>
            {editingServiceId ? 'Editar servicio' : 'Nuevo servicio del hostal'}
          </h3>
          <div className="form-grid">
            <label className="field">Nombre<input
              required
              maxLength="100"
              value={newService.nombre}
              onChange={e => setNewService({ ...newService, nombre: e.target.value })}
            /></label>
            <label className="field">Categoría<input
              required
              maxLength="100"
              value={newService.categoria}
              onChange={e => setNewService({ ...newService, categoria: e.target.value })}
              placeholder="Instalaciones / Espacios comunes"
            /></label>
            <label className="field">Modalidad<input
              required
              maxLength="100"
              value={newService.modalidad}
              onChange={e => setNewService({ ...newService, modalidad: e.target.value })}
            /></label>
            <label className="field">Descripción<textarea
              required
              maxLength="500"
              rows="3"
              value={newService.descripcion}
              onChange={e => setNewService({ ...newService, descripcion: e.target.value })}
            /></label>
            <div className="form-wide">
              <PhotoManager
                titulo={`Fotografías de ${newService.nombre || 'servicio'}`}
                fotos={newService.fotos}
                pendientes={servicePhotos}
                onFilesChange={setServicePhotos}
                nuevo={!editingServiceId}
                busy={busy}
                onEliminar={removeServicePhoto}
                onReordenar={reorderServicePhotos}
                onLimpiarRotas={cleanServicePhotos}
              />
            </div>
          </div>

          <label className="checkbox-line"><input
            type="checkbox"
            checked={newService.activo}
            onChange={e => setNewService({ ...newService, activo: e.target.checked })}
          /> Publicar servicio en el sitio</label>
          <label className="checkbox-line"><input
            type="checkbox"
            checked={newService.mostrarPortada}
            onChange={e => setNewService({ ...newService, mostrarPortada: e.target.checked })}
          /> Incluir estas fotografías en el carrusel de la portada (solo espacios del hostal, no habitaciones)</label>
          <p className="notice soft small">Para fotos exclusivas de la portada utiliza Administración → Portada, sin crear servicios ficticios. Los textos nuevos de servicios requieren traducción manual.</p>
          <div className="admin-actions">
            <button disabled={busy} className="btn primary">{editingServiceId ? 'Guardar cambios' : 'Guardar servicio'}</button>
            <button type="button" className="btn secondary" onClick={resetService}>Cancelar</button>
          </div>
        </form>}
        <div className="form-panel admin-list">
          {servicios.map(s => <div key={s.id} className="admin-list-row service-admin-row">
            {s.fotos?.[0] && <img className="service-admin-thumb" src={s.fotos[0]} alt="" />}
            <div className="service-admin-info">
              <strong>{s.nombre}</strong>
              <p>{s.categoria} · {s.modalidad} · {s.activo ? 'Visible' : 'Oculto'} · {s.fotos?.length || 0} fotos{s.mostrarPortada ? ' · En portada' : ''}</p>
            </div>
            <div className="admin-actions">
              <button type="button" className="btn small" disabled={busy} onClick={() => editService(s)}>Editar / Fotos</button>
              <button
                type="button"
                className="btn secondary small"
                disabled={busy}
                onClick={() => work(() => guardarServicio(s.id, { activo: !s.activo }))}
              >{s.activo ? 'Ocultar' : 'Publicar'}</button>
              <button
                type="button"
                className="btn small danger-outline"
                disabled={busy}
                onClick={() => removeService(s)}
              >Eliminar</button>
            </div>
          </div>)}
          {servicios.length === 0 && <p>Puedes registrar el primer servicio con el formulario anterior.</p>}
        </div>
      </>}
      {tab === 'portada' && <>
        <div className="admin-page-head">
          <h2>Fotografías de portada</h2>
          <p>Administra las imágenes generales del hostal independientemente de Habitaciones y Servicios. Esta configuración no es un cuarto CRUD de negocio.</p>
        </div>
        <form className="form-panel stack" onSubmit={saveCover}>
          <p className="muted">Sube fotos de fachada, recepción, patio y espacios comunes. El orden elegido aquí determina las primeras imágenes del carrusel.</p>
          <PhotoManager
            titulo="Portada del hostal"
            fotos={portada.fotos}
            pendientes={portadaFiles}
            onFilesChange={setPortadaFiles}
            onEliminar={removeCoverPhoto}
            onReordenar={reorderCoverPhotos}
            onLimpiarRotas={cleanCoverPhotos}
            busy={busy}
          />
          <label className="checkbox-line"><input
            type="checkbox"
            checked={portada.incluirFotosServicios}
            onChange={e => setPortada(prev => ({ ...prev, incluirFotosServicios: e.target.checked }))}
          />
            Incluir además fotografías de servicios activos marcados «Mostrar en portada».</label>
          <p className="notice soft small">Las fotografías propias de portada aparecen primero. Si está marcada la casilla, se añaden fotografías de servicios activos hasta completar 12 imágenes. Nunca se toman fotografías del catálogo de habitaciones. Los cambios se ven al actualizar Inicio.</p>
          <div className="admin-actions">
            <button type="submit" className="btn primary" disabled={busy}>Guardar portada y subir nuevas fotos</button>
          </div>
        </form>
      </>}
    </div>
  </div>;
}
// Edición de una solicitud: el administrador registra contacto, estado y verificación manual.
function RequestAdmin({ solicitud: s, onSave, busy }) {
  const [form, setForm] = useState({ estado: s.estado, nombre: s.nombre, email: s.email, telefono: s.telefono || '', observaciones: '' }), [verificado, setVerificado] = useState(false), [history, setHistory] = useState(null), [error, setError] = useState('');
  useEffect(() => {
    setForm({ estado: s.estado, nombre: s.nombre, email: s.email, telefono: s.telefono || '', observaciones: '' });
    setVerificado(false);
  }, [s.id, s.estado, s.nombre, s.email, s.telefono]);
  async function openHistory() {
    try {
      setHistory((await obtenerHistorial(s.id)).sort((a, b) => (b.fechaCambio?.seconds || 0) - (a.fechaCambio?.seconds || 0)));
    }
    catch (e) {
      setError(e.message);
    }
  }
  async function save(e) {
    e.preventDefault();
    setError('');
    if (form.estado === 'Confirmada' && s.estado !== 'Confirmada' && !verificado) {
      setError('Marca la revisión manual de Booking antes de confirmar.');
      return;
    }
    await onSave({ ...form, verificacionManual: verificado });
  }
  return <article className="form-panel request-admin-card">
    <div className="between">
      <h3>{s.nombre} · {s.email}</h3>
      <span className={`status ${String(s.estado).toLowerCase()}`}>{s.estado}</span>
    </div>
    <p className="muted small">Solicitud {s.id} · {toDate(s.fechaEntrada)} → {toDate(s.fechaSalida)} · {s.huespedes} huéspedes</p>
    <div className="request-details">
      {s.detalleHabitaciones?.map((d, i) => <p key={i}>{d.cantidad} × {d.nombre || d.habitacionId} · {formatoCLP(d.tarifaAplicada)} por noche · Subtotal {formatoCLP(d.subtotal)}</p>)}
      <p>
        <strong>Total conservado: {formatoCLP(s.totalCotizado)}</strong>
      </p>
      <p>Estacionamiento: {s.estacionamientoSolicitado ? 'Solicitado' : 'No solicitado'}</p>
      <p className="request-client-comments"><strong>Comentarios del huésped:</strong> {s.comentarios || 'Sin comentarios adicionales.'}</p>
    </div>
    <form onSubmit={save} className="stack">
      <div className="form-grid">
        <label className="field">Nombre<input value={form.nombre} required onChange={e => setForm({ ...form, nombre: e.target.value })} /></label>
        <label className="field">Correo<input
          type="email"
          required
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
        /></label>
        <label className="field">Teléfono<input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></label>
        <label className="field">Estado<select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>{STATES.map(s => <option key={s}>{s}</option>)}</select></label>
      </div>
      <label className="checkbox-line"><input type="checkbox" checked={verificado} onChange={e => setVerificado(e.target.checked)} /> He comprobado la disponibilidad manualmente en Booking.</label>
      <label className="field">Observaciones del cambio (registro de historial)<textarea
        rows="2"
        maxLength="500"
        value={form.observaciones}
        onChange={e => setForm({ ...form, observaciones: e.target.value })}
      /></label>
      {error && <p className="notice error" role="alert">{error}</p>}
      <div className="admin-actions">
        <button className="btn primary small" disabled={busy}>Guardar solicitud</button>
        <button
          className="btn secondary small"
          type="button"
          onClick={() => setForm({ ...form, estado: 'Archivada' })}
        >Marcar archivada</button>
        <button className="btn secondary small" type="button" onClick={openHistory}>Ver historial</button>
      </div>
    </form>
    {history && <div className="history">
      <h4>Historial administrativo</h4>
      {history.length === 0 ? <p>Sin cambios registrados.</p> : history.map(h => <p key={h.id}>{toDate(h.fechaCambio)} · {h.accion} · Admin: {h.administradorId} · {h.observaciones || 'Sin observaciones'}</p>)}
    </div>}
  </article>;
}
