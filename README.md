# La Casa de José — Plataforma web multilingüe

Proyecto de Título de Ingeniería en Informática (IPLACEX, 2026).

## Descripción

Aplicación web para el Hostal La Casa de José, ubicado en San Pedro de Atacama, Chile. El objetivo es ofrecer un canal propio de información y cotizaciones directas, complementario a Booking.

Una solicitud de alojamiento no equivale a una reserva confirmada: la disponibilidad y la aceptación final quedan sujetas a revisión del establecimiento.

## Estado de desarrollo

**Etapa 2 — Secciones públicas del sitio.** La aplicación cuenta con una página de inicio, navegación, catálogo de seis categorías de habitaciones, fichas informativas y sección de servicios. La navegación y los textos principales están disponibles en español, inglés, portugués, alemán y francés.

**Datos ilustrativos:** las capacidades, superficies y descripciones de la demostración se utilizan únicamente para visualizar la interfaz; no deben interpretarse como información comercial verificada. Las fotografías reales, tarifas, cotizaciones, solicitudes y autenticación todavía no están conectadas en esta etapa.

## Tecnologías incorporadas

- JavaScript, React y Vite para la interfaz.
- React Router para las rutas públicas.
- CSS propio adaptable a distintas pantallas.
- Context API de React para seleccionar el idioma de la interfaz.
- Datos locales de demostración, temporalmente sin conexión a base de datos.

## Ejecutar localmente

Requiere Node.js 20.19 o superior y npm.

```bash
npm ci
npm run dev
```

Abrir la dirección local que indique Vite (generalmente `http://127.0.0.1:5173`).

## Compilar

```bash
npm run build
npm run preview
```

La carpeta `dist/` es generada automáticamente y no se sube al repositorio.

## Estructura principal

```text
src/
├── components/        # Navegación, tarjetas y galería
├── context/           # Idiomas de la interfaz
├── lib/               # Datos de demostración y traducciones
├── pages/             # Inicio, habitaciones, detalle y servicios
├── App.jsx            # Rutas públicas
├── main.jsx           # Punto de entrada
└── styles.css         # Estilos adaptables
public/flags/          # Iconos de idioma en formato SVG
```

## Alcance previsto

Se integrarán progresivamente los procesos de cotización, solicitudes, acceso de clientes y un panel administrativo con CRUD de habitaciones, tarifas y solicitudes. No se contemplan pagos en línea ni sincronización automática con Booking.

## Autor

Angel Jose Ignacio Bruzzese Araya — Proyecto de Título, IPLACEX.
