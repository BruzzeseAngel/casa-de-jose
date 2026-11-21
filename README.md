# La Casa de José — Plataforma web multilingüe

Proyecto de Título de Ingeniería en Informática — IPLACEX (2026).

## Descripción

Aplicación web del Hostal La Casa de José, San Pedro de Atacama, Chile. Permite explorar alojamientos y preparar cotizaciones de demostración como alternativa de contacto directo complementaria a Booking.

**Una solicitud no constituye una reserva confirmada.** Toda disponibilidad y aceptación final queda a cargo del administrador del hostal.

## Estado — versión 0.5.0 (integración progresiva)

Esta etapa integra el **módulo de Firebase Authentication para clientes** (opcional según la configuración), conservando el catálogo y las solicitudes de prueba de etapas anteriores. No es todavía la plataforma completa desplegada.

### Funcionalidades disponibles

- Portada, catálogo de seis categorías, fichas de habitación y servicios.
- Interfaz con español, inglés, portugués, alemán y francés.
- Cotizador ficticio con noches, capacidad, selección de categorías, subtotal neto e IVA del 19 %.
- Guardado y eliminación **local** de solicitudes ficticias en `sessionStorage`, sin datos de contacto.
- **Firebase Authentication** cuando se configura: crear cuenta, iniciar sesión, cerrar sesión, restaurar contraseña y mantener la sesión.
- Área de cliente `/mis-solicitudes` protegida por sesión **sin mostrar todavía solicitudes reales**.
- Solicitudes ficticias separadas en `/solicitudes-demo`, sin vinculación con cuentas reales.
- Pruebas automatizadas de cálculo, almacenamiento demostrativo y validación de configuración.

### Lo que aún no está integrado

- Firestore y persistencia de solicitudes reales.
- Perfiles guardados en `usuarios` y custom claims de administración.
- Panel administrativo, CRUD de habitaciones, servicios, tarifas y solicitudes.
- Fotos reales con Storage, Cloud Functions, notificaciones, reglas de seguridad de datos y despliegue.
- Sincronización de disponibilidad con Booking y pagos en línea (fuera del alcance del proyecto).

**Seguridad:** la protección de rutas con React no sustituye reglas de seguridad de Firestore. No se activan operaciones reales de datos hasta integrar las reglas de acceso y las funciones del servidor. Las tarifas y capacidades mostradas son ficticias, no precios oficiales. La recuperación de contraseña requiere un proveedor Firebase configurado. Usar cuentas de prueba.

## Requisitos

- Node.js **20.19+** y npm.
- Para pruebas sin servidor, no hace falta configurar Firebase.
- Para probar autenticación real, un proyecto Firebase habilitado con el método **Email/Password** y el dominio autorizado.

## Instalación rápida (demostración)

```bash
npm ci
npm test
npm run dev
```

Por defecto se utiliza `VITE_DEMO_MODE=true` (o no se define la variable). No se crea ninguna cuenta de Firebase. Visita `/solicitudes-demo` para ver pruebas locales.

## Activar Firebase Authentication (opcional)

1. Crea el archivo `.env` copiando `.env.example` (no publiques `.env`).
2. Completa `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` y `VITE_FIREBASE_APP_ID` con la **configuración web** de Firebase.
3. Cambia `VITE_DEMO_MODE=false`.
4. En Firebase Console > Authentication > Sign-in method, habilita **Correo electrónico/Contraseña**.
5. Revisa **Authorized domains** y agrega tu dominio de pruebas si hace falta.
6. Reinicia Vite mediante `npm run dev` y entra a `/acceso`.
7. Usa correos de prueba. La creación de usuarios en Firebase Authentication **sí es real** cuando este modo está activado; la gestión de solicitudes todavía no.

Las variables públicas `VITE_*` llegan al navegador: **nunca** coloques allí claves de cuenta de servicio, tokens privados, contraseñas, secretos de correo ni APIs restringidas. Aplica restricciones de la clave web según la documentación de Firebase y controla el uso del proyecto.

## Comprobación

```bash
npm test
npm run build
npm run preview
```

Comprobaciones recomendadas: modo demostración sin cuenta, formulario de cotización, navegación de 5 idiomas; con Firebase activado, registrar cuenta de prueba, iniciar sesión, refrescar, salir, intentar ruta protegida sin sesión, recuperar contraseña. La compilación con Vite debe realizarse localmente.

## Estructura principal

```text
src/
  context/        LanguageContext.jsx, AuthContext.jsx
  components/     Layout.jsx, ProtectedRoute.jsx, RoomCard.jsx, PhotoGallery.jsx
  lib/            firebase.js, authConfig.mjs, authCopy.js, demo*.js, quote.mjs
  pages/          Home.jsx, Rooms.jsx, RoomDetail.jsx, Services.jsx,
                  Quote.jsx, Access.jsx, ClientArea.jsx, MyRequests.jsx
  App.jsx         Rutas públicas, pruebas y rutas protegidas
  main.jsx        Proveedores y entrada React
tests/              Pruebas de lógica pura
.env.example        Plantilla sin credenciales
```

## Desarrollo del proyecto

El desarrollo de la aplicación y su incorporación a este repositorio corresponden a procesos distintos: los módulos se están integrando y documentando aquí por etapas funcionales. Las fechas de los commits representan publicaciones de integración, no necesariamente la fecha original de programación de cada módulo.

## Autor / proyecto académico

Angel Jose Ignacio Bruzzese Araya — Proyecto de Título, IPLACEX.
