import {useEffect,useState} from 'react';

/** Galería reutilizable. Funciona con 1 o N URL de Firebase Storage.
 * No genera fotos ficticias y ofrece controles de teclado y texto alternativo.
 */
export default function PhotoGallery({fotos=[],alt='Fotografía de habitación',className='',placeholder=null,children=null}){
 const images=(Array.isArray(fotos)?fotos:[]).filter(url=>typeof url==='string'&&url.trim());
 const [active,setActive]=useState(0),[failed,setFailed]=useState([]);
 useEffect(()=>{setActive(0);setFailed([]);},[images.join('|')]);
 // Si un archivo fue borrado directamente de Storage, no mostramos un cuadro
 // roto ni lo contamos en el carrusel. La referencia se limpia en Administración.
 const disponibles=images.filter(url=>!failed.includes(url));
 const next=()=>setActive(i=>(i+1)%disponibles.length);
 const previous=()=>setActive(i=>(i+disponibles.length-1)%disponibles.length);
 const indice=Math.min(active,Math.max(0,disponibles.length-1));
 return <div className={`photo-gallery ${className}`} role="region" aria-label={`Galería: ${alt}`}
   tabIndex={disponibles.length>1?0:undefined}
   onKeyDown={e=>{if(disponibles.length>1&&e.key==='ArrowLeft'){e.preventDefault();previous()}if(disponibles.length>1&&e.key==='ArrowRight'){e.preventDefault();next()}}}>
   {disponibles.length>0?<img src={disponibles[indice]} alt={`${alt} (${indice+1}/${disponibles.length})`} loading="lazy"
     onError={()=>setFailed(old=>old.includes(disponibles[indice])?old:[...old,disponibles[indice]])}/>:placeholder??<div className="photo-placeholder"><span>◇</span><small>LA CASA DE JOSÉ</small></div>}
   {disponibles.length>1&&<>
      <button type="button" className="gallery-arrow gallery-prev" onClick={previous} aria-label="Fotografía anterior">‹</button>
      <button type="button" className="gallery-arrow gallery-next" onClick={next} aria-label="Fotografía siguiente">›</button>
      <span className="gallery-counter" aria-live="polite">{indice+1} / {disponibles.length}</span>
   </>}
   {children}
 </div>;
}
