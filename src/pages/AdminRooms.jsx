import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DEMO } from '../lib/firebase';
import { DEMO_ROOMS } from '../lib/demo';
import { useCatalog } from '../context/CatalogContext';
import { useAuth } from '../context/AuthContext';
import { HABITACION_VACIA, habitacionAFormulario, normalizarListaAdmin, validarHabitacion } from '../lib/adminRoomsModel.mjs';
import { obtenerHabitacionesAdmin, crearHabitacionAdmin, editarHabitacionAdmin, cambiarPublicacionHabitacion } from '../lib/adminRoomsFirestore';

export default function AdminRooms() {
  const { user } = useAuth();
  const { recargar } = useCatalog();
  const [habitaciones, setHabitaciones] = useState(() => DEMO ? normalizarListaAdmin(DEMO_ROOMS) : []);
  const [loading, setLoading] = useState(!DEMO);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(() => ({ ...HABITACION_VACIA }));

  const cargar = useCallback(async () => {
    if (DEMO) return;
    const datos = await obtenerHabitacionesAdmin();
    setHabitaciones(datos);
  }, []);

  useEffect(() => {
    if (DEMO) return undefined;
    let activo = true;
    obtenerHabitacionesAdmin().then(datos => { if (activo) setHabitaciones(datos); })
      .catch(err => { if (activo) setError(err?.message || 'No se pudo cargar el listado.'); })
      .finally(() => { if (activo) setLoading(false); });
    return () => { activo = false; };
  }, []);

  function limpiar() {
    setEditando(null);
    setForm({ ...HABITACION_VACIA });
  }
  function editar(habitacion) {
    setError(''); setAviso('');
    setEditando(habitacion);
    setForm(habitacionAFormulario(habitacion));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function cambiar(nombre, valor) {
    setForm(prev => ({ ...prev, [nombre]: valor }));
  }

  async function operar(accion, exito) {
    if (DEMO || busy) return;
    setBusy(true); setError(''); setAviso('');
    try {
      await accion();
      await cargar();
      setAviso(exito);
      // Propagar altas/ediciones/bajas al catálogo público de la misma pestaña.
      await recargar();
    } catch (err) {
      setError(err?.message || 'No fue posible completar la operación.');
    } finally { setBusy(false); }
  }

  async function guardar(event) {
    event.preventDefault();
    if (DEMO || busy) return;
    let datos;
    try { datos = validarHabitacion(form, editando?.fotos ?? []); }
    catch (err) { setError(err.message); return; }
    await operar(async () => {
      if (editando) {
        // No reescribir fotos al editar datos; evita pisar subidas concurrentes.
        const { fotos: _fotos, ...campos } = datos;
        await editarHabitacionAdmin(editando.id, campos);
      } else await crearHabitacionAdmin(datos);
      limpiar();
    }, editando ? 'Categoría actualizada.' : 'Categoría creada.');
  }

  async function cambiarEstado(habitacion, publica) {
    if (DEMO || busy) return;
    if (!publica && !window.confirm(
      `¿Retirar «${habitacion.nombre}» del catálogo?\n\nNo se borrarán sus tarifas, fotos ni solicitudes anteriores. Podrás restaurarla.`
    )) return;
    await operar(async () => {
      await cambiarPublicacionHabitacion(habitacion.id, publica);
      if (editando?.id === habitacion.id) limpiar();
    }, publica ? 'Categoría restaurada.' : 'Categoría retirada del catálogo público.');
  }

  const activas = habitaciones.filter(h => h.activa === true).length;
  const boton = busy ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear categoría';

  return <section className="container section admin-rooms-page">
    <div className="admin-room-header">
      <div><p className="overline">LA CASA DE JOSÉ · ADMINISTRACIÓN</p>
        <h1>Gestión de habitaciones</h1>
        <p className="muted">CRUD de categorías de alojamiento. La eliminación es lógica: conserva fotos, tarifas e historial.</p>
      </div>
      <Link className="btn secondary" to="/habitaciones">Ver catálogo público</Link>
    </div>
    {DEMO && <p className="notice warning" role="status">Demostración de solo lectura. Para guardar cambios, configura Firebase e ingresa con una cuenta administradora.</p>}
    {!DEMO && <p className="notice soft small">Cuenta: {user?.email}. Las escrituras deben estar autorizadas por reglas de Firestore y la custom claim <code>admin</code>.</p>}
    {error && <p className="notice error" role="alert">{error}</p>}
    {aviso && <p className="notice success" role="status">{aviso}</p>}
    <div className="admin-room-grid">
      <form className="form-panel stack admin-room-editor" onSubmit={guardar}>
        <div className="between"><h2>{editando ? 'Editar categoría' : 'Nueva categoría'}</h2>
          {editando && <button type="button" className="btn secondary small" disabled={busy} onClick={limpiar}>Cancelar edición</button>}</div>
        <fieldset className="admin-room-fieldset" disabled={busy || DEMO}>
          <div className="admin-room-fields">
            <label className="field">Nombre de la habitación
              <input required maxLength="100" minLength="2" value={form.nombre} onChange={e => cambiar('nombre', e.target.value)} placeholder="Doble Estándar" /></label>
            <div className="admin-room-two-cols">
              <label className="field">Capacidad por unidad
                <input type="number" required min="1" max="50" step="1" value={form.capacidad} onChange={e => cambiar('capacidad', e.target.value)} /></label>
              <label className="field">Stock total
                <input type="number" required min="1" max="500" step="1" value={form.stockTotal} onChange={e => cambiar('stockTotal', e.target.value)} /></label>
            </div>
            <label className="field">Superficie (m²)
              <input type="number" required min="0.1" max="10000" step="0.1" value={form.tamanoM2} onChange={e => cambiar('tamanoM2', e.target.value)} /></label>
            <label className="field">Camas, separadas por comas
              <input required value={form.camas} onChange={e => cambiar('camas', e.target.value)} placeholder="Cama matrimonial, Cama individual" /></label>
            <label className="field">Comodidades, separadas por comas
              <input value={form.comodidades} onChange={e => cambiar('comodidades', e.target.value)} placeholder="Wi-Fi, Baño privado" /></label>
            <label className="checkbox-line admin-room-checkbox">
              <input type="checkbox" checked={form.activa} onChange={e => cambiar('activa', e.target.checked)} /> Publicar en el catálogo
            </label>
          </div>
          <p className="muted small">Las categorías nuevas comienzan ocultas. Las fotografías existentes se conservarán; la edición de imágenes llegará en el parche 0.8.</p>
          <button className="btn primary" disabled={busy || DEMO} type="submit">{boton}</button>
        </fieldset>
      </form>
      <div className="form-panel admin-room-list">
        <div className="between"><h2>Categorías registradas</h2><span className="admin-room-count">{activas} activas / {habitaciones.length}</span></div>
        {loading && <p role="status">Cargando habitaciones…</p>}
        {!loading && habitaciones.length === 0 && <p className="muted">No hay categorías registradas.</p>}
        {!loading && <ul className="admin-room-items">
          {habitaciones.map(h => <li key={h.id} className="admin-room-item">
            <div className="admin-room-item-details">
              <strong>{h.nombre || 'Sin nombre'}</strong>
              <span className={`admin-room-status ${h.activa ? 'is-active' : 'is-inactive'}`}>{h.activa ? 'Activa' : 'Fuera del catálogo'}</span>
              <p>{h.capacidad} huéspedes · {h.stockTotal} unidades · {h.tamanoM2} m²</p>
              <small>{h.fotos?.length ?? 0} fotografías · ID: {h.id}</small>
            </div>
            <div className="admin-room-item-actions">
              <button type="button" className="btn secondary small" disabled={busy || DEMO} onClick={() => editar(h)}>Editar</button>
              {h.activa
                ? <button type="button" className="btn small admin-room-danger" disabled={busy || DEMO} onClick={() => cambiarEstado(h, false)}>Eliminar</button>
                : <button type="button" className="btn small secondary" disabled={busy || DEMO} onClick={() => cambiarEstado(h, true)}>Restaurar</button>}
            </div>
          </li>)}
        </ul>}
      </div>
    </div>
  </section>;
}
