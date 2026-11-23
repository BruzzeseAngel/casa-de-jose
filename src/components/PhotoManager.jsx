import {useEffect,useState} from 'react';
import {detectarFotosInexistentes} from '../lib/data';
import {fotosValidas} from '../lib/photoManagement.mjs';

/** Gestor compartido por habitaciones, servicios y portada.
 * - Las miniaturas muestran URLs YA guardadas en Firestore.
 * - Los nuevos archivos son una cola local: se suben al pulsar Guardar.
 * - Eliminar/reordenar actúa sobre Firestore inmediatamente y no requiere
 *   eliminar archivos a mano en Firebase Console.
 */
export default function PhotoManager({titulo='Fotografías',fotos=[],pendientes=[],onFilesChange,
  onEliminar,onReordenar,onLimpiarRotas,busy=false,limite=12,nuevo=false}) {
  const lista = fotosValidas(fotos);
  const [previews,setPreviews]=useState([]);
  const [ausentes,setAusentes]=useState([]);
  const [error,setError]=useState('');
  const [comprobando,setComprobando]=useState(false);
  const [revision,setRevision]=useState(false);
  // No dejamos object URLs en memoria al cambiar de archivos o desmontar el panel.
  useEffect(()=>{
    const urls=pendientes.map(archivo=>URL.createObjectURL(archivo));
    setPreviews(urls);
    return ()=>urls.forEach(url=>URL.revokeObjectURL(url));
  },[pendientes]);
  useEffect(()=>{setAusentes([]);setRevision(false);},[lista.join('|')]);

  function seleccionar(event) {
    const archivos=Array.from(event.target.files||[]);
    event.target.value='';
    if (!archivos.length) return;
    if (lista.length+pendientes.length+archivos.length>limite) {
      setError(`Se permiten hasta ${limite} fotos en total.`);return;
    }
    if (archivos.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>=5*1024*1024)) {
      setError('Usa JPG, PNG o WebP con menos de 5 MB por fotografía.');return;
    }
    setError('');onFilesChange([...pendientes,...archivos]);
  }

  async function comprobar() {
    setComprobando(true);setError('');setRevision(false);
    try {const rotas=await detectarFotosInexistentes(lista);setAusentes(rotas);setRevision(true);}
    catch(e){setError(e.message);}
    finally{setComprobando(false);}
  }

  async function quitarRota() {
    if (!ausentes.length||!window.confirm(`¿Quitar ${ausentes.length} enlace(s) sin archivo de Storage? Solo se actualizará Firestore.`))return;
    try{await onLimpiarRotas(ausentes);setAusentes([]);setRevision(false)}catch(e){setError(e.message)}
  }

  return <section className="photo-admin-manager" aria-label={titulo}>
    <div className="photo-admin-heading"><div><h4>{titulo}</h4>
      <p className="muted small">{lista.length} guardadas · {pendientes.length} nuevas · Máximo {limite}.</p></div>
      {lista.length>0&&<button className="btn small secondary" type="button" disabled={busy||comprobando}
        onClick={comprobar}>{comprobando?'Comprobando…':'Comprobar enlaces'}</button>}
    </div>
    <p className="muted small">Puedes eliminar una foto incorrecta, cambiar su orden o limpiar enlaces de archivos que borraste en Storage.</p>
    {revision&&<div className={`notice ${ausentes.length?'warning':'success'}`} role="status">
      {ausentes.length?<>Se encontraron {ausentes.length} foto(s) cuyo archivo ya no existe. <button type="button" className="btn small danger-outline" disabled={busy}
        onClick={quitarRota}>Quitar referencias rotas</button></>:'No se encontraron archivos faltantes entre las fotos del Storage de este proyecto.'}
    </div>}
    {error&&<p className="notice error" role="alert">{error}</p>}
    {lista.length>0&&<div className="photo-admin-grid">{lista.map((url,i)=><div className="photo-admin-tile" key={url}>
      <div className="photo-admin-preview"><img src={url} alt={`Fotografía guardada ${i+1}`} loading="lazy"
        onError={e=>{e.currentTarget.style.display='none';e.currentTarget.nextElementSibling.hidden=false;}}/>
        <span className="photo-admin-broken" hidden>Archivo no disponible</span>
        <span className="photo-admin-order">{i+1} / {lista.length}</span>
      </div>
      <div className="photo-admin-tile-actions">
        <button type="button" className="btn small secondary" title="Mover a la izquierda" aria-label={`Mover foto ${i+1} a la izquierda`}
          disabled={busy||i===0} onClick={()=>onReordenar(i,i-1)}>←</button>
        <button type="button" className="btn small secondary" title="Mover a la derecha" aria-label={`Mover foto ${i+1} a la derecha`}
          disabled={busy||i===lista.length-1} onClick={()=>onReordenar(i,i+1)}>→</button>
        <button type="button" className="btn small danger-outline" disabled={busy}
          onClick={()=>{if(window.confirm(`¿Eliminar la fotografía ${i+1} de ${titulo.toLowerCase()}?`))onEliminar(url)}}>Eliminar</button>
      </div>
    </div>)}</div>}
    {lista.length===0&&<p className="photo-admin-empty">Todavía no hay fotografías guardadas.</p>}
    <div className="photo-admin-upload">
      <label className="field">Agregar imágenes (JPG, PNG o WebP; menos de 5 MB)
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy||lista.length+pendientes.length>=limite}
          onChange={seleccionar}/></label>
      <small className="muted">{nuevo?'Las fotografías se subirán al crear el registro.':'Las imágenes seleccionadas se subirán cuando pulses Guardar.'}</small>
      {pendientes.length>0&&<div className="photo-admin-grid">{pendientes.map((archivo,i)=><div className="photo-admin-tile" key={`${archivo.name}-${i}`}>
        <div className="photo-admin-preview"><img src={previews[i]} alt={`Imagen por subir ${archivo.name}`}/><span className="photo-admin-pending">Pendiente</span></div>
        <div className="photo-admin-tile-actions"><button type="button" className="btn small secondary" disabled={busy}
          onClick={()=>onFilesChange(pendientes.filter((_,j)=>j!==i))}>Quitar selección</button></div>
      </div>)}</div>}
    </div>
  </section>;
}
