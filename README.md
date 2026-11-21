# La Casa de José — Plataforma web multilingüe

Proyecto de Título de Ingeniería en Informática — IPLACEX (2026).

## Descripción

Sitio web del Hostal La Casa de José, San Pedro de Atacama. Muestra alojamiento y servicios, permite explorar tarifas orientativas y preparar solicitudes de prueba. Es un canal complementario a Booking. **Una solicitud no confirma una reserva: la disponibilidad y aceptación final corresponden al hostal.**

## Estado — integración progresiva v0.6.0

Esta entrega incorpora **lectura pública de Firestore** para el catálogo. Se conserva el acceso de clientes con Firebase Authentication incorporado en v0.5 y se mantiene el formulario de solicitudes como **demostración local**.

### Funcionalidades disponibles

- Portada, habitaciones, detalles, servicios e instalaciones en cinco idiomas: ES, EN, PT, DE, FR.
- Configuración de Firebase Authentication para registro, ingreso, cierre de sesión y recuperación de contraseña (requiere modo Firebase).
- Lectura de documentos activos en las colecciones `/habitaciones` y `/servicios`.
- Lectura de tarifas desde `/habitaciones/{habitacionId}/tarifas`; las tarifas se asocian por el **ID real** de cada habitación.
- La portada, el listado, los detalles, los servicios y la vista previa del cotizador usan una fuente de catálogo compartida (`CatalogContext`).
- Control de carga, resultados vacíos y fallos de conexión/permisos para que no se muestre una pantalla en blanco.
- Cotizador con selección de fechas, huéspedes, categorías, stock, subtotal neto, IVA y total **orientativo**.
- Solicitudes de **prueba local** que solo conservan el resumen de una cotización en `sessionStorage`; no transmiten ni guardan datos personales.
- Pruebas automatizadas de normalización de datos, cotizaciones, configuración de Firebase y almacenamiento demostrativo.

### Dos modos de funcionamiento

**Demo (predeterminado)**: `VITE_DEMO_MODE=true` o variable sin definir. Se muestran datos y tarifas **ficticias**, sin comunicación con Firestore. Las solicitudes siguen siendo simuladas; Authentication real está desactivado.

**Firebase**: `VITE_DEMO_MODE=false` + cuatro parámetros públicos de Firebase definidos. Se habilita Authentication y se consulta Firestore para el **catálogo público**. No se rellenan fallos o colecciones vacías con datos ficticios: si las reglas no permiten lectura, se muestra un aviso. Las tarifas proceden de Firestore y se usan solo para una **vista previa orientativa**, sin reservas ni pagos reales.

**Importante:** esta etapa no implementa aún persistencia de solicitudes en Firestore, perfiles de `/usuarios`, funciones servidor para cotizar de forma autoritativa ni CRUD administrativos. Acceder a `/mis-solicitudes` solo demuestra protección de ruta, no obtiene solicitudes reales. Las solicitudes ficticias se consultan en `/solicitudes-demo` y nunca se asocian a usuarios reales.

## Modelo Firestore consultado (solo lectura)

```text
/habitaciones/{habitacionId}
  nombre: string
  capacidad: number
  stockTotal: number
  tamanoM2: number
  activa: boolean
  camas: string[]
  comodidades: string[]
  fotos: string[]
  /tarifas/{tarifaId}
    precioDirecto: number
    vigente: boolean
    fechaInicio: timestamp | fecha ISO
    tipoPrecio: "neto" | "iva-incluido" (opcional para registros antiguos)

/servicios/{servicioId}
  nombre, categoria, modalidad, descripcion: string
  activo: boolean
  fotos: string[] (opcional)
```

Las tarifas `tipoPrecio=neto` agregan IVA del 19 % en el cálculo de muestra; registros antiguos sin `tipoPrecio` se interpretan como precio **con IVA incluido**. El sistema no determina automáticamente exenciones tributarias. El resultado no confirma precios ni disponibilidad.

Las consultas públicas utilizan los filtros `activa == true` y `activo == true`. Asegura que las reglas de seguridad publicadas en tu proyecto permitan leer **solo documentos activos y sus tarifas**, mientras que la escritura se restringe a administradores o al backend según corresponda. **No cambies las reglas por `allow read, write: if true`**. Este parche no incluye ni despliega reglas de Firestore, ni modifica datos existentes.

## Requisitos

- Node.js 20.19 o superior; npm.
- Para modo Firebase: proyecto Firebase existente, Firestore configurado, reglas de lectura pública seguras y Authentication Email/Password activado.
- No se requiere Firebase para ejecutar la demostración.

## Instalación y pruebas

```bash
npm ci
npm test
npm run build
npm run dev
```

Prueba la navegación en `http://127.0.0.1:5173`. Si ejecutas `npm run preview`, revisa también el formulario.

### Activar lectura real (opcional)

1. Copia `.env.example` a `.env` en la carpeta raíz.
2. Define `VITE_DEMO_MODE=false` y los parámetros `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` y `VITE_FIREBASE_APP_ID` (configuración **web** de Firebase, nunca secretos de servidor).
3. Reinicia `npm run dev` después de modificar las variables.
4. Confirma la existencia de documentos activos y tarifas vigentes en Firestore; revisa las reglas de acceso antes de probar.
5. Visita `/habitaciones`, `/habitaciones/{id}`, `/servicios` y `/cotizar`. Comprueba las tarjetas y las tarifas. **No crees solicitudes reales en esta etapa**.

> Los parámetros `VITE_*` se incorporan al código cliente. No pongas contraseñas, tokens privados, credenciales Admin SDK ni secretos de correo. `.env` está ignorado por Git.

## Archivos principales

```text
src/
  context/
    AuthContext.jsx              # Sesión Firebase (v0.5)
    CatalogContext.jsx           # Carga y comparte catálogo público (v0.6)
    LanguageContext.jsx          # Traducciones
  lib/
    firebase.js                  # Inicializa Authentication y Firestore
    catalogFirestore.js         # Consultas getDocs() solo de lectura
    catalogModel.mjs            # Transformaciones puras, testeables
    quote.mjs                   # Cálculo de cotizaciones, sin backend
    demo.js                     # Catálogo ficticio para modo demostración
  pages/
    Home.jsx, Rooms.jsx, RoomDetail.jsx, Services.jsx, Quote.jsx
  main.jsx                      # Proveedores React
  App.jsx                       # Rutas públicas y protegidas

tests/catalogModel.test.mjs     # Pruebas de normalización
```

## Qué falta integrar

Administración y los tres CRUD de negocio, almacenamiento de fotografías con Firebase Storage, tarifas editables en panel admin, solicitudes persistentes con Cloud Functions, perfiles y roles administrativos, historial, notificaciones, reglas auditadas y despliegue final. No hay pagos en línea ni disponibilidad sincronizada automáticamente con Booking (fuera del alcance definido).

## Historial de integración

El proyecto existía antes de su incorporación a este repositorio. Los commits documentan **la integración y verificación progresiva de módulos**, no una cronología de autoría o fecha original de programación.

## Autor / proyecto académico

Angel Jose Ignacio Bruzzese Araya — Proyecto de Título, IPLACEX.
