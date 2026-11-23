# La Casa de José — Proyecto de título

Plataforma web multilingüe para el Hostal La Casa de José (San Pedro de Atacama, Chile). Proyecto de título de Ingeniería en Informática, IPLACEX, 2026.

> **Estado del repositorio: etapa de integración 0.8 (backend original).** A partir de este commit, el código del **frontend** (`src/`, `tests/`, `scripts/`, `index.html`, `vite.config.js` y dependencias) proviene **sin modificaciones funcionales** de la copia definitiva entregada como `Proyecto(2).zip` (21/11/2026). Las fechas de publicación de GitHub representan integración de archivos, no necesariamente sus fechas originales de desarrollo. El `package.json` conserva la versión `1.0.0` del proyecto fuente, aunque esta entrega se denomine parche 08.

## Alcance del proyecto definitivo (frontend incorporado)

- Portada, habitaciones, servicios e instalaciones en cinco idiomas: ES, EN, PT, DE y FR.
- Cotización multihabitación: fechas, stock, huéspedes, desglose neto/IVA (19 %), precios referenciales y selector informativo de divisas.
- Formulario de solicitud con nombre, correo, **teléfono obligatorio** y **comentarios opcionales (máximo 500 caracteres)**.
- Registro e inicio de sesión con Firebase Authentication; vista privada de solicitudes.
- Administración unificada en **`/admin`**: habitaciones (baja lógica), tarifas por temporada, solicitudes e historial, servicios y fotografías con Firebase Storage.
- En modo Firebase, las operaciones sensibles utilizan las Cloud Functions y el backend desplegado por separado. El envío de una solicitud **no** constituye una reserva confirmada; la confirmación corresponde al hostal.

## Alcance de **esta publicación GitHub — parche 08**

El parche 7.5 incorporó literalmente el frontend de `Proyecto(2).zip`, restaurando las rutas `/admin` y `/mis-solicitudes`, los estilos y el cotizador definitivo. **Este parche 08 no toca ningún archivo de `src/`, ni modifica el frontend funcional.**

Ahora se incorporan literalmente las **Cloud Functions del proyecto definitivo** y sus pruebas de backend:

- `crearSolicitud`: valida datos y cotiza en el servidor, usando las tarifas que realmente están guardadas en Firestore; incorpora el texto opcional `comentarios`.
- `guardarTarifa`: crea o actualiza tarifas con validaciones y autorización de administrador, manteniendo compatibilidad con registros históricos que incluyen IVA.
- `actualizarSolicitud`: actualiza datos de contacto y estado, exige verificación manual de disponibilidad antes de confirmar y registra historial.
- `notificarNuevaSolicitud`: envía aviso al administrador mediante Resend cuando se crea una solicitud; la clave es un **secreto de Firebase**, no un dato de GitHub.
- `pricing.js`, `comentarios.js` y `correoContenido.js`: reglas reutilizables y pruebas unitarias. Los archivos `pricing.js` y `functions/package.json` ya estaban publicados y permanecen sin cambios.

**Estado actual:** el código frontend y backend existe en el repositorio, pero **todavía no se incorporan** `firebase.json`, `.firebaserc`, `firestore.rules`, `storage.rules` y `firestore.indexes.json`. Esos archivos deben incorporarse y revisarse en el siguiente parche antes de considerar un despliegue desde esta carpeta. El proyecto que actualmente funciona en Firebase Hosting **no se modifica** al publicar este commit en GitHub. No ejecutes `firebase deploy` desde este repositorio parcial.

Los archivos de entorno (`.env`, `functions/.env`, `functions/.env.casa-de-jose-pruebas`), claves, credenciales y artefactos `dist/` se **excluyen** de GitHub. El backend requiere configuración local y permisos apropiados para funcionar contra Firebase; **tener el código publicado no significa que se hayan ejecutado las funciones reales**.

## Inicio local

Requiere Node.js `>=20.19.0` y npm.

```bash
npm ci
npm test
npm run build
npm run dev
```

Sin archivo `.env`, el proyecto abre en **modo demostración** (`VITE_DEMO_MODE` distinto de `false`), con precios y contenidos ilustrativos. En este modo no se envían solicitudes ni se crean cuentas reales.

Para conectarlo a Firebase, copia `.env.example` a `.env`, completa **solo los datos públicos de configuración web** y utiliza `VITE_DEMO_MODE=false`. Nunca publiques `.env`, credenciales Admin SDK, claves privadas ni tokens de correo. La configuración real debe validarse en tu entorno antes de activarla.

## Pruebas y estructura

`npm test` ejecuta pruebas unitarias del frontend: cotización, IVA, divisas, traducciones, filtros de solicitudes y gestión de fotografías. Para probar el backend desde `functions/` utiliza `npm test`. Estas pruebas puras no sustituyen la comprobación de Firestore, Authentication, Storage, seguridad y notificaciones reales.

```bash
# Desde la raíz del repositorio
npm test
npm run build

# Luego, en el directorio functions
cd functions
npm ci
npm test
cd ..
```


```text
src/
  App.jsx                  Rutas definitivas
  pages/                   Portada, habitaciones, cotización, acceso, solicitudes, Admin.jsx
  components/              Galería, selector de divisas, PhotoManager, RoomCard
  context/                 Auth, Language, Currency
  lib/                     data.js (Firestore/Storage/Functions), quote.mjs y utilidades
  styles.css               Diseño definitivo
scripts/                   Utilidades administrativas del proyecto fuente
public/flags/              Iconos SVG de idiomas
tests/                     Pruebas unitarias originales
functions/
  index.js                 Funciones crearSolicitud, guardarTarifa, actualizarSolicitud
  notificarNuevaSolicitud.js  Aviso de solicitudes mediante Resend
  pricing.js               Fechas, validaciones y cálculos de precios e IVA
  comentarios.js           Normaliza el campo opcional del huésped
  correoContenido.js       Contenido del correo escapando HTML
  *.test.js                Pruebas unitarias del backend
```

Las Cloud Functions se incorporaron **sin cambios** desde el ZIP definitivo. No existe nueva lógica ni rutas añadidas en este parche; solamente se documentó su incorporación. Las variables de correo de Firebase son `RESEND_API_KEY` (secreto), `ADMIN_EMAIL`, `RESEND_FROM` y `SITE_URL` (parámetros del servidor). No coloques estos datos en el código cliente ni los subas a GitHub.

Los scripts `seed` y `admin` actúan sobre Firebase y **no deben ejecutarse sin revisar previamente el proyecto y los permisos**. Los valores de la demostración no constituyen precios oficiales del hostal.

## Criterio de continuidad

**Fuente de verdad:** `Proyecto(2).zip`, que incluye el campo de comentarios y la corrección del estado del formulario de cotización. Los parches posteriores deben añadir los archivos originales faltantes, sin reescribir el frontend ni el backend sin una revisión y aprobación previa. Antes del último commit se verificará la igualdad de archivos funcionales con la fuente.

## Autoría y contexto

Proyecto de título presentado por Angel Jose Ignacio Bruzzese Araya, IPLACEX. Este repositorio registra la incorporación progresiva del código y no representa por sí solo una cronología de desarrollo individual.
