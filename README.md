# La Casa de José — Plataforma web multilingüe

Proyecto de título de Ingeniería en Informática (IPLACEX, 2026) para el Hostal La Casa de José, ubicado en San Pedro de Atacama, Chile.

## Objetivo y alcance

La aplicación ofrece un **canal directo complementario a Booking** para consultar habitaciones y servicios, calcular importes orientativos y enviar solicitudes de alojamiento. **Una solicitud no es una reserva confirmada**: el administrador debe comprobar la disponibilidad y comunicar su aceptación al huésped. No se realizan pagos en línea ni sincronización automática de inventario con Booking.

Este repositorio contiene el código fuente y los archivos de configuración de la plataforma web del Hostal La Casa de José. Su organización permite mantener el control de versiones, documentar las funcionalidades implementadas y facilitar la revisión, ejecución y mantenimiento del sistema.

## Funcionalidades

- **Público:** portada, catálogo de seis categorías de habitación, fichas y servicios; interfaz en español, inglés, portugués, alemán y francés.
- **Cotización:** fechas, noches, cantidad de habitaciones, huéspedes, estimación neta, IVA chileno del 19 % y total; selector de otras monedas únicamente referencial. El servidor recalcula los importes al crear una solicitud.
- **Solicitudes:** envío como invitado o cliente, con nombre, correo, teléfono y campo **Comentarios (opcional)** de hasta 500 caracteres. Se registra inicialmente en estado `Pendiente`; no implica confirmación.
- **Clientes:** registro e ingreso con Firebase Authentication y consulta privada de sus solicitudes.
- **Administración:** acceso protegido en `/admin`, gestión de habitaciones, tarifas, solicitudes e historial, servicios y fotografías; las habitaciones se retiran mediante desactivación lógica.
- **Servicios Firebase:** Firestore, Storage, Cloud Functions y aviso al administrador mediante Resend cuando está configurado.

El modo demostración contiene datos **ficticios**. Sus montos, descripciones y cantidades no son ofertas ni disponibilidad confirmada del hostal.

## Tecnologías

- React 19, JavaScript, Vite 7, React Router y CSS propio adaptable a pantallas móviles.
- Firebase Authentication, Cloud Firestore, Cloud Storage, Cloud Functions y Firebase Hosting.
- Node.js 22 en las Cloud Functions.
- Pruebas unitarias nativas con `node:test`.

## Requisitos

- Node.js `>=20.19.0` y npm, para frontend.
- Para operar contra Firebase: proyecto habilitado, permisos adecuados y configuración web **pública** de la aplicación; el backend requiere sus propios parámetros y secreto de correo.

## Ejecución local en modo demostración

```bash
npm ci
npm test
npm run build
npm run dev
```

Abre la URL local que indique Vite. Si no existe `.env`, la aplicación utiliza datos demostrativos (`VITE_DEMO_MODE` es distinto de `false`). En este modo **no se envían solicitudes reales**.

Si necesitas crear `.env`, copia `.env.example` y mantén `VITE_DEMO_MODE=true`. El archivo `.env` **no debe publicarse**.

### Pruebas del backend

```bash
cd functions
npm ci
npm test
cd ..
```

Estas pruebas verifican lógica pura; no sustituyen pruebas reales con Auth, Firestore, Storage, Functions, Hosting ni Resend.

## Estructura del repositorio

```text
src/
  App.jsx                 Rutas públicas, de cliente y administrador
  pages/                  Inicio, habitaciones, servicios, cotización, acceso y administración
  components/             Tarjetas, galería, gestión fotográfica y selector de divisas
  context/                Sesión, traducciones y divisas
  lib/data.js             Integración con Firestore, Storage y Cloud Functions
  lib/quote.mjs           Vista previa de cotización
  styles.css              Diseño adaptable
functions/
  index.js                Crear solicitud, guardar tarifa y actualizar solicitud
  notificarNuevaSolicitud.js  Aviso administrativo por Resend
  pricing.js              Reglas de precios y cálculo de IVA en el servidor
  comentarios.js          Normalización de comentarios del huésped
  correoContenido.js      Contenido seguro del mensaje
  *.test.js               Pruebas de backend
scripts/                   Utilidades de carga demo y permisos administrativos
tests/                     Pruebas del frontend
public/flags/              Recursos locales del selector de idioma
firebase.json             Hosting, Functions, Firestore, Storage y emuladores
.firebaserc               Alias del proyecto Firebase y destino de Hosting
firestore.rules            Reglas de acceso a la base de datos
storage.rules              Reglas para almacenamiento de fotografías
firestore.indexes.json     Índices de consultas
docs/                       Documentación de arquitectura, pruebas, seguridad e integridad
```

## Mapa de persistencia y permisos (Cloud Firestore y Storage)
 
La base de datos documental se organiza en las siguientes rutas:
 
```text
/habitaciones/{habitacionId}
  /tarifas/{tarifaId}
/usuarios/{usuarioId}
/solicitudes/{solicitudId}
  /historial/{historialId}
/servicios/{servicioId}
/configuracion/portada
```
 
- **Frontend (`src/`):** React renderiza páginas, formularios y paneles; `src/lib/data.js` centraliza lecturas por SDK y las llamadas a Cloud Functions. Las lecturas del cliente quedan sujetas a las reglas de Firebase.
- **Backend (`functions/`):** `index.js` implementa operaciones protegidas, como la creación de solicitudes y la actualización de tarifas y solicitudes; `pricing.js` valida los importes, y `notificarNuevaSolicitud.js` gestiona la notificación administrativa mediante Resend cuando está configurado.
- **Firestore (`firestore.rules`):** define los permisos de acceso para colecciones y documentos según identidad y autorización. El archivo `firestore.indexes.json` declara un índice compuesto sobre `solicitudes` (`usuarioId` ascendente y `createdAt` descendente). La existencia de la definición en GitHub no demuestra por sí sola que el índice esté desplegado.
- **Storage (`storage.rules`):** define restricciones para los archivos fotográficos. Las fotografías residen en Storage y sus referencias se conservan en documentos de Firestore.
- **Configuración (`firebase.json`):** relaciona Hosting, Functions, Firestore, Storage y emuladores. La aplicación publicada y el repositorio de código son recursos relacionados, pero no contienen necesariamente el mismo estado operativo en un instante dado.
 
Consulta [Arquitectura y flujo de datos](docs/ARQUITECTURA.md) y [Configuración, seguridad y despliegue](docs/SEGURIDAD_Y_DESPLIEGUE.md) para más detalles. Las cuentas, datos reales, claves privadas y secretos no están incluidos en GitHub.

## Documentación

- [Arquitectura y flujo de datos](docs/ARQUITECTURA.md)
- [Pruebas y validación](docs/PRUEBAS_Y_VALIDACION.md)
- [Configuración, seguridad y despliegue](docs/SEGURIDAD_Y_DESPLIEGUE.md)
- [Integridad y verificación del proyecto](docs/INTEGRIDAD.md)

## Seguridad y despliegue

Antes de ejecutar un despliegue o utilizar los scripts de administración, se debe verificar el proyecto Firebase seleccionado y el destino de publicación. El archivo `.firebaserc` establece el alias `pruebas` para el proyecto `casa-de-jose-pruebas` y vincula el destino lógico `principal` de Hosting con el sitio `hostal-la-casa-de-jose`. Consulta la documentación de seguridad y despliegue antes de modificar la configuración.

Nunca subas `.env`, `functions/.env*`, claves de cuenta de servicio, tokens privados ni secretos de Resend. Las variables `VITE_*` se incorporan al cliente web y no deben contener secretos. El código fuente **no** incluye ni reemplaza los documentos existentes de Firestore, las imágenes almacenadas en Storage, los usuarios de Authentication ni los parámetros y secretos configurados en Firebase.

## Estado de validación

La validación académica del sistema registra 56 pruebas automatizadas aprobadas, distribuidas en 35 pruebas de la aplicación y 21 del backend. Adicionalmente, se ejecutaron 14 casos de prueba manuales sobre la plataforma publicada y sus servicios integrados. Los resultados, las evidencias y las limitaciones de las verificaciones se encuentran documentados en los capítulos VIII y IX y en el Anexo D del informe del Proyecto de Título.

## Contexto académico

Proyecto de Título de Ingeniería en Informática desarrollado por Angel Jose Ignacio Bruzzese Araya, Instituto Profesional IPLACEX, 2026.

El repositorio contiene el código fuente, las configuraciones y la documentación técnica de la plataforma web del Hostal La Casa de José.
