# La Casa de José — Plataforma web multilingüe

Proyecto de Título de Ingeniería en Informática (IPLACEX, 2026).

## Descripción

Aplicación web para el Hostal La Casa de José, en San Pedro de Atacama (Chile). Busca ofrecer un canal propio para presentar habitaciones y servicios y solicitar cotizaciones, como complemento a Booking.

**Una solicitud no es una reserva confirmada:** la disponibilidad y aceptación final corresponden al administrador del establecimiento. Esta versión **no está conectada al hostal**.

## Estado actual — versión 0.4.0

Esta cuarta etapa incorpora un **prototipo funcional de solicitudes locales** y la interfaz inicial del área cliente. Se apoya en el catálogo y la cotización de demostración de las etapas 02 y 03.

### Funcionalidades demostrables

- Portada, catálogo de seis categorías de habitación y fichas individuales.
- Servicios e instalaciones y selector de idioma **español, inglés, portugués, alemán y francés**.
- Navegación entre secciones con React Router.
- Cotización de prueba: fechas, huéspedes, tipos y cantidades de habitaciones.
- Resumen referencial en CLP, subtotal neto, IVA del 19 % y total.
- Validación de fechas, límites de estadía, capacidad y stock ilustrativos.
- **Guardar una solicitud ficticia en el almacenamiento de sesión de la pestaña** mediante el formulario `/cotizar`.
- **Consultar y eliminar** esas pruebas desde `/mis-solicitudes`.
- Pantalla `/acceso` que anticipa el futuro área cliente, **sin inicio de sesión real**.
- **15 pruebas automáticas** con `node:test` (cotizaciones y solicitudes demostrativas).

### Advertencias indispensables

- **No hay autenticación ni autorización.** `/acceso` no pide contraseñas ni verifica identidades; `/mis-solicitudes` es una demostración pública de interfaz, no un panel privado.
- **No se envía ninguna solicitud** a Firebase, correo electrónico, Booking o al hostal. El estado `Pendiente` es únicamente simulado.
- Solo se almacenan **fechas, IDs de habitaciones, cantidades, número de huéspedes e importes ficticios**. Los campos de nombre, email, teléfono y comentarios **no se guardan ni transmiten**.
- Las pruebas permanecen en `sessionStorage` durante la sesión de esa pestaña. No se comparten con otros dispositivos ni representan registros persistentes del negocio. Se pueden perder al cerrar la pestaña.
- **Utiliza siempre datos ficticios.** Los precios, capacidades y montos son ilustrativos; no reflejan necesariamente disponibilidad ni tarifas del hostal.
- Los cálculos de IVA son una simulación. No se concede ni se determina automáticamente una exención tributaria.
- Esta versión **no incluye CRUD administrativo**, administración de tarifas, Cloud Firestore, Firebase Authentication ni Firebase Hosting. Tampoco hay cobros en línea o sincronización con Booking.

## Tecnologías

- JavaScript y React: componentes, propiedades, estado y eventos.
- React Router: rutas públicas y navegación.
- React Context API: selección de idioma.
- CSS propio adaptable a pantallas de escritorio y móviles.
- `sessionStorage`: persistencia temporal del prototipo de solicitudes, sin datos de contacto.
- Vite: servidor local y compilación.
- Node.js `node:test`: pruebas unitarias, sin conexión externa.

## Instalación local

Requiere **Node.js 20.19 o posterior** y npm.

```bash
npm ci
npm run dev
```

Vite mostrará la dirección local (normalmente `http://127.0.0.1:5173`).

## Verificación y compilación

```bash
npm test
npm run build
npm run preview
```

Para recorrer el flujo de esta etapa:

1. Abre `/cotizar`, selecciona fechas futuras, habitaciones y huéspedes válidos.
2. Completa los datos de **prueba** requeridos por el formulario; no uses datos reales.
3. Pulsa **Guardar solicitud de prueba**. Se mostrará una confirmación local.
4. Abre **Mis solicitudes (demo)**. Verás la solicitud con estado simulado `Pendiente`.
5. Actualiza la página; la prueba debe seguir disponible en esa pestaña.
6. Elimina la prueba desde el listado y verifica que desaparezca.
7. Visita `/acceso` y comprueba que indique expresamente que **no existe autenticación real**.
8. Repite en móvil y prueba el selector de cinco idiomas.

`npm run build` genera archivos en `dist/`, carpeta excluida del repositorio.

## Estructura principal

```text
src/
├── components/            # Navegación, tarjetas y galería
├── context/               # Selección de idioma
├── lib/
│   ├── contentTranslations.js
│   ├── demo.js             # Habitaciones, servicios y tarifas ficticias
│   ├── quote.mjs           # Cálculo puro de cotizaciones
│   ├── quoteCopy.js        # Textos de cotización
│   ├── demoRequests.mjs    # Guardado/lectura/borrado SOLO local
│   └── demoRequestCopy.js  # Textos multilingües del prototipo
├── pages/
│   ├── Home.jsx
│   ├── Rooms.jsx
│   ├── RoomDetail.jsx
│   ├── Services.jsx
│   ├── Quote.jsx           # Cotizar y guardar prueba
│   ├── Access.jsx          # Página informativa, sin autenticación
│   └── MyRequests.jsx      # Listar y eliminar pruebas locales
├── App.jsx                 # Rutas
├── main.jsx                # Entrada
└── styles.css              # Diseño adaptable
tests/
├── quote.test.mjs          # Pruebas de cálculo
└── demoRequests.test.mjs   # Pruebas de solicitudes locales
public/flags/               # Banderas locales de idioma
```

## Siguientes etapas

Integración de **Firebase Authentication** para clientes; persistencia segura en **Cloud Firestore** y reglas de acceso; creación de solicitudes mediante backend, consulta privada por usuario y gestión de estados por administrador; tres CRUD de negocio (habitaciones, tarifas y solicitudes), pruebas de integración y despliegue. Estas funciones **aún no están disponibles** en la presente versión.

## Autor

Angel Jose Ignacio Bruzzese Araya — Proyecto de Título, IPLACEX.
