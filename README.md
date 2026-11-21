# La Casa de José — Plataforma web multilingüe

Proyecto de Título de Ingeniería en Informática (IPLACEX, 2026).

## Descripción

Aplicación web para el Hostal La Casa de José, en San Pedro de Atacama, Chile. Su objetivo es proporcionar un canal propio para informar sobre alojamientos, explorar servicios y preparar cotizaciones directas, complementario a Booking.

**Importante:** una solicitud de alojamiento no constituye una reserva confirmada. La disponibilidad y aceptación final siempre deberán ser verificadas por el administrador.

## Estado actual — versión 0.3.0

En esta etapa se incorporó un **formulario de cotización de demostración** a las secciones públicas creadas anteriormente.

Funcionalidades disponibles:

- Portada, navegación y catálogo de seis categorías de habitaciones.
- Fichas individuales y presentación de servicios e instalaciones.
- Selector de idioma en español, inglés, portugués, alemán y francés.
- Acceso a `/cotizar` desde el menú, la portada y las fichas de habitación.
- Selección de entrada, salida, huéspedes, categorías y cantidades.
- Vista previa del importe en pesos chilenos (CLP), con subtotal neto, IVA del 19 % y total referencial.
- Validaciones de duración de la estadía, cantidades máximas y capacidad combinada.
- Campos de contacto, comentarios y estacionamiento, con **validación local, sin envío**.
- Pruebas automáticas de la lógica de cotización con `node:test`.

### Limitaciones de la demostración

**No hay operaciones reales del hostal en esta versión.** Los precios, las capacidades y otros datos de ejemplo son ilustrativos y **no constituyen tarifas oficiales ni disponibilidad verificada**. No se realizan solicitudes HTTP desde el formulario, ni se almacenan ni envían sus datos. Para las pruebas, utiliza nombres y correos ficticios. No existe aún autenticación ni conexión a Firebase o a servicios de reservas. El cálculo fiscal es demostrativo y no determina automáticamente exenciones de IVA.

La persistencia de solicitudes, autenticación de usuarios, administración de habitaciones/tarifas y seguridad de Firestore se incorporarán progresivamente en etapas posteriores.

## Tecnologías

- JavaScript y React para componentes y estados.
- Vite para desarrollo y compilación.
- React Router para la navegación entre páginas.
- Context API para mantener el idioma seleccionado.
- CSS propio adaptable a dispositivos de escritorio y móviles.
- `node:test` para verificar funciones puras de cálculo, sin servicios externos.

## Instalación

**Requisitos:** Node.js 20.19 o superior y npm.

```bash
npm ci
npm run dev
```

Abre la dirección que muestre Vite (habitualmente `http://127.0.0.1:5173`).

## Pruebas y compilación

```bash
npm test
npm run build
npm run preview
```

`npm test` comprueba las funciones de cálculo de noches, selección de tarifas, impuestos y reglas de stock. `npm run build` genera `dist/`, que no se incorpora al repositorio.

## Estructura principal

```text
src/
├── components/         # Navegación, tarjetas y galería
├── context/            # Idioma de la interfaz
├── lib/
│   ├── contentTranslations.js
│   ├── demo.js          # Habitaciones y tarifas ficticias
│   ├── quote.mjs        # Cálculo puro de cotizaciones
│   └── quoteCopy.js     # Textos específicos del formulario
├── pages/
│   ├── Home.jsx
│   ├── Rooms.jsx
│   ├── RoomDetail.jsx
│   ├── Services.jsx
│   └── Quote.jsx        # Formulario de demostración
├── App.jsx              # Rutas
├── main.jsx             # Entrada
└── styles.css           # Interfaz adaptable
tests/quote.test.mjs      # Pruebas de lógica de cotización
public/flags/            # Iconos locales de idiomas
```

## Próximos módulos

Acceso de clientes y gestión de solicitudes, integración controlada con Firebase Authentication y Cloud Firestore, operaciones CRUD de negocio (habitaciones, tarifas, solicitudes), seguridad del servidor y despliegue. No se contemplan pagos en línea ni sincronización automática de disponibilidad con Booking.

## Autor

Angel Jose Ignacio Bruzzese Araya — Proyecto de Título, IPLACEX.
