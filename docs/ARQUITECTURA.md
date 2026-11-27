# Arquitectura y flujo funcional

Documento de referencia del **código incluido en el repositorio**. No reemplaza el informe académico ni supone que los servicios externos estén configurados.

## Componentes

1. **Interfaz:** React + React Router; `src/App.jsx` declara páginas públicas, de clientes y de administración.
2. **Estado de aplicación:** contextos de autenticación, idioma y divisa en `src/context/`.
3. **Datos y llamadas:** `src/lib/data.js` concentra las consultas y operaciones con Firebase; `src/lib/firebase.js` inicializa SDK web y permite modo DEMO.
4. **Cálculos preliminares:** `src/lib/quote.mjs` entrega la vista previa en el navegador.
5. **Servidor:** `functions/index.js` expone las operaciones sensibles por Cloud Functions; `functions/pricing.js` valida fechas, tarifas y cálculos, sin confiar en el total informado por el navegador.
6. **Persistencia y seguridad:** Firestore, Storage, Authentication, `firestore.rules` y `storage.rules`. Los permisos administrativos se asocian a una custom claim del token de Firebase.
7. **Notificaciones:** `functions/notificarNuevaSolicitud.js` prepara y solicita el envío de un mensaje al administrador mediante Resend, si están configurados sus parámetros y su secreto.

## Camino de una cotización

```text
Huésped → /cotizar → vista previa (React)
                    ↓
              crearSolicitud (Cloud Function)
                    ↓
       validaciones y recálculo desde Firestore
                    ↓
       /solicitudes/{id} (estado «Pendiente»)
                    ↓
       notificarNuevaSolicitud → Resend (si configurado)
                    ↓
       administrador revisa disponibilidad manualmente
                    ↓
       actualizarSolicitud → historial de estados
```

El campo `comentarios` se recoge en el formulario, se normaliza en el servidor y acompaña la solicitud. Es diferente de `observaciones`, que corresponde al historial administrativo.

## Colecciones principales de Firestore

```text
/habitaciones/{habitacionId}
  /tarifas/{tarifaId}
/servicios/{servicioId}
/usuarios/{usuarioId}
/solicitudes/{solicitudId}
  /historial/{historialId}
/configuracion/portada
```

Las fotografías de habitaciones, servicios y portada se almacenan en Firebase Storage; en Firestore se guardan las URLs y metadatos que utiliza la aplicación. Las tarifas pertenecen a subcolecciones de las habitaciones.

## Módulos de administración

El panel administrativo se encuentra implementado en `src/pages/Admin.jsx` y es accesible mediante la ruta `/admin` para los usuarios autorizados. Contiene las secciones de gestión de habitaciones, tarifas, solicitudes, servicios y configuración de portada, centralizando las principales operaciones administrativas del establecimiento.

La eliminación de habitaciones se implementa como **baja lógica** (`activa=false`). La gestión de servicios tiene operaciones propias según `src/lib/data.js`, incluida la eliminación definitiva. Las solicitudes se archivan mediante estado en lugar de desaparecer físicamente, y los cambios administrativos relevantes guardan historial.

## Multilenguaje, divisas e impuestos

La interfaz permite ES, EN, PT, DE y FR. El selector de divisas muestra **estimaciones**; el precio cotizado se mantiene en CLP y el servidor calcula los importes desde las tarifas almacenadas. Las tarifas nuevas consideran importe neto y desglose del IVA del 19 %; el backend conserva compatibilidad con tarifas históricas que incluían IVA.

La gestión de disponibilidad en Booking es **manual**: no existe una API de sincronización que confirme reservas automáticamente.
