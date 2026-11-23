# La Casa de José — Proyecto de título

Plataforma web multilingüe para el Hostal La Casa de José (San Pedro de Atacama, Chile). Proyecto de título de Ingeniería en Informática, IPLACEX, 2026.

> **Estado del repositorio: etapa de integración 0.9 (configuración Firebase original).** A partir de este commit, el código del **frontend** (`src/`, `tests/`, `scripts/`, `index.html`, `vite.config.js` y dependencias) proviene **sin modificaciones funcionales** de la copia definitiva entregada como `Proyecto(2).zip` (21/11/2026). Las fechas de publicación de GitHub representan integración de archivos, no necesariamente sus fechas originales de desarrollo. El `package.json` conserva la versión `1.0.0` del proyecto fuente, aunque esta entrega se denomine parche 09.

## Alcance del proyecto definitivo (frontend incorporado)

- Portada, habitaciones, servicios e instalaciones en cinco idiomas: ES, EN, PT, DE y FR.
- Cotización multihabitación: fechas, stock, huéspedes, desglose neto/IVA (19 %), precios referenciales y selector informativo de divisas.
- Formulario de solicitud con nombre, correo, **teléfono obligatorio** y **comentarios opcionales (máximo 500 caracteres)**.
- Registro e inicio de sesión con Firebase Authentication; vista privada de solicitudes.
- Administración unificada en **`/admin`**: habitaciones (baja lógica), tarifas por temporada, solicitudes e historial, servicios y fotografías con Firebase Storage.
- En modo Firebase, las operaciones sensibles utilizan las Cloud Functions y el backend desplegado por separado. El envío de una solicitud **no** constituye una reserva confirmada; la confirmación corresponde al hostal.

## Alcance de **esta publicación GitHub — parche 09**

Los parches 7.5 y 08 incorporaron el **frontend y backend sin modificaciones funcionales** desde `Proyecto(2).zip`. El parche 09 incorpora **cinco archivos originales, sin alterar su contenido**:

- `firebase.json`: declara Firestore, Storage, Functions, Hosting y puertos de emuladores. Su Hosting usa el destino lógico `principal` y publica `dist/`.
- `.firebaserc`: define el alias `pruebas` para el proyecto `casa-de-jose-pruebas` y asocia el destino `principal` con el sitio `hostal-la-casa-de-jose`.
- `firestore.rules`: controla la lectura pública de documentos activos y las escrituras autorizadas mediante la custom claim `admin`; solicitudes y tarifas se escriben desde Cloud Functions.
- `storage.rules`: admite lectura pública de fotografías de catálogo y restringe su administración a cuentas con claim `admin`, tamaño menor de 5 MiB y formatos JPEG/PNG/WebP.
- `firestore.indexes.json`: declara el índice compuesto para consultar solicitudes por `usuarioId` y `createdAt`.

**No se modifica ningún archivo de `src/`, `functions/` ni `tests/`.** Las reglas, índices y configuración se incluyen para completar el código del repositorio; **no se han desplegado desde GitHub** y su publicación mediante `git push` no modifica Firebase.

### Advertencia importante sobre Hosting

La configuración original asigna `hosting.target = principal` y lo vincula al **sitio** `hostal-la-casa-de-jose`. Ese destino no coincide nominalmente con la URL de pruebas `casa-de-jose-pruebas.web.app` utilizada durante el proyecto. **Antes de ejecutar cualquier `firebase deploy` desde esta copia**, verifica con Firebase CLI y Firebase Console el proyecto y el sitio de Hosting de destino. No cambies `.firebaserc` ni `firebase.json` sin acordarlo y probarlo antes.

En esta etapa se publica **solamente en GitHub**; no se deben ejecutar `firebase deploy`, `npm run seed` ni `npm run admin` como parte de la instalación del parche.

No se publican archivos `.env`, variables privadas de Functions, cuentas de servicio ni `dist/`. Los nombres públicos de proyecto y sitio en `.firebaserc` no son credenciales de acceso.

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
firebase.json              Firebase Hosting, Firestore, Storage, Functions y emuladores
.firebaserc                Alias y destino de Hosting originales (revisar antes de desplegar)
firestore.rules            Seguridad de Cloud Firestore
storage.rules              Seguridad de Firebase Storage
firestore.indexes.json     Índice compuesto de solicitudes
```

Las Cloud Functions y la configuración Firebase provienen **sin cambios** desde el ZIP definitivo. El parche 09 solo incorpora archivos de configuración y reglas; no añade nuevas funcionalidades ni despliega servicios. Las variables de correo de Firebase son `RESEND_API_KEY` (secreto), `ADMIN_EMAIL`, `RESEND_FROM` y `SITE_URL` (parámetros del servidor). No coloques estos datos en el código cliente ni los subas a GitHub.

Los scripts `seed` y `admin` actúan sobre Firebase y **no deben ejecutarse sin revisar previamente el proyecto y los permisos**. Los valores de la demostración no constituyen precios oficiales del hostal.

## Criterio de continuidad

**Fuente de verdad:** `Proyecto(2).zip`, que incluye el campo de comentarios y la corrección del estado del formulario de cotización. El parche final se dedicará a documentar y verificar la paridad con la fuente, sin reescribir el frontend ni el backend sin revisión y aprobación previa. Antes del último commit se verificará la igualdad de archivos funcionales con la fuente.

## Autoría y contexto

Proyecto de título presentado por Angel Jose Ignacio Bruzzese Araya, IPLACEX. Este repositorio registra la incorporación progresiva del código y no representa por sí solo una cronología de desarrollo individual.
