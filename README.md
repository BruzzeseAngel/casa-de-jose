# La Casa de José — Proyecto de título

Plataforma web multilingüe para el Hostal La Casa de José (San Pedro de Atacama, Chile). Proyecto de título de Ingeniería en Informática, IPLACEX, 2026.

> **Estado del repositorio: etapa de alineación 0.7.5.** A partir de este commit, el código del **frontend** (`src/`, `tests/`, `scripts/`, `index.html`, `vite.config.js` y dependencias) proviene **sin modificaciones funcionales** de la copia definitiva entregada como `Proyecto(2).zip` (21/11/2026). Las fechas de publicación de GitHub representan integración de archivos, no necesariamente sus fechas originales de desarrollo. El `package.json` conserva la versión `1.0.0` del proyecto fuente, aunque este commit se denomine parche 7.5.

## Alcance del proyecto definitivo (frontend incorporado)

- Portada, habitaciones, servicios e instalaciones en cinco idiomas: ES, EN, PT, DE y FR.
- Cotización multihabitación: fechas, stock, huéspedes, desglose neto/IVA (19 %), precios referenciales y selector informativo de divisas.
- Formulario de solicitud con nombre, correo, teléfono opcional y **comentarios opcionales (máximo 500 caracteres)**.
- Registro e inicio de sesión con Firebase Authentication; vista privada de solicitudes.
- Administración unificada en **`/admin`**: habitaciones (baja lógica), tarifas por temporada, solicitudes e historial, servicios y fotografías con Firebase Storage.
- En modo Firebase, las operaciones sensibles utilizan las Cloud Functions y el backend desplegado por separado. El envío de una solicitud **no** constituye una reserva confirmada; la confirmación corresponde al hostal.

## Alcance de **esta publicación GitHub 0.7.5**

Se han reemplazado las versiones experimentales del frontend publicadas hasta 0.7.0 por los **archivos exactos del frontend definitivo**. Dejan de existir `/administracion`, `/solicitudes-demo` y el `sessionStorage` de solicitudes ficticias de los parches intermedios; se restauran `/admin`, `/mis-solicitudes`, los formularios y componentes originales y las reglas de negocio del frontend. **No se cambia el proyecto desplegado en Firebase Hosting** al subir este commit a GitHub.

**Todavía no están incorporadas las Cloud Functions para desplegar en este repositorio**: únicamente se incluyen `functions/pricing.js` y `functions/package.json` porque las pruebas originales de IVA utilizan ese módulo compartido. Quedan pendientes `firestore.rules`, `storage.rules`, `firebase.json`, `firestore.indexes.json`, la implementación de Cloud Functions y las guías de despliegue del backend definitivo. Se integrarán literalmente desde la misma copia fuente en parches siguientes, tras revisar su configuración. Hasta entonces, el repositorio se puede probar localmente en modo demostración. Para usar operaciones reales se requiere un proyecto Firebase ya configurado, funciones desplegadas y reglas de seguridad vigentes. No uses el repositorio parcial para desplegar backend ni reglas.

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

`npm test` ejecuta pruebas unitarias de cotización, IVA, divisas, traducciones, filtros de solicitudes y gestión de fotografías. No sustituye las pruebas reales de Firestore, Authentication, Storage, Cloud Functions ni el despliegue.

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
```

Los scripts `seed` y `admin` actúan sobre Firebase y **no deben ejecutarse sin revisar previamente el proyecto y los permisos**. Los valores de la demostración no constituyen precios oficiales del hostal.

## Criterio de continuidad

**Fuente de verdad:** `Proyecto(2).zip`, que incluye el campo de comentarios y la corrección del estado del formulario de cotización. Los parches posteriores deben añadir los archivos originales faltantes, no reescribir los módulos del frontend sin una revisión y aprobación previa. Antes del último commit se verificará la igualdad de archivos funcionales con la fuente.

## Autoría y contexto

Proyecto de título presentado por Angel Jose Ignacio Bruzzese Araya, IPLACEX. Este repositorio registra la incorporación progresiva del código y no representa por sí solo una cronología de desarrollo individual.
