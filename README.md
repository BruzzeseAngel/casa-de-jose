# La Casa de José — Plataforma web multilingüe

Proyecto de Título de Ingeniería en Informática (IPLACEX, 2026).

## Descripción

Aplicación web orientada al Hostal La Casa de José, ubicado en San Pedro de Atacama, Chile. El objetivo es disponer de un canal propio para mostrar habitaciones y servicios, consultar tarifas directas y gestionar solicitudes de alojamiento desde una interfaz multilingüe.

El sistema está concebido como un **canal complementario a Booking**. El envío de una solicitud no implica una reserva confirmada: la disponibilidad y la aceptación final corresponden al administrador del establecimiento.

## Estado del proyecto

**En desarrollo.** Esta primera versión contiene la estructura básica de una aplicación React, una página de inicio provisional y estilos CSS iniciales. Las funciones de cotización, autenticación y administración todavía no forman parte de esta versión publicada.

## Tecnologías utilizadas en esta etapa

- **JavaScript**: lenguaje de programación.
- **React**: biblioteca para construir la interfaz mediante componentes.
- **Vite**: entorno de desarrollo y herramienta de compilación.
- **CSS**: estilos de la interfaz.

## Requisitos

- Node.js 20.19 o superior.
- npm.

## Instalación y ejecución local

```bash
npm ci
npm run dev
```

La terminal mostrará la dirección local donde abrir la aplicación.

## Compilación

```bash
npm run build
npm run preview
```

`build` genera los archivos para publicación en `dist/`, carpeta que no se versiona en Git.

## Estructura inicial

```text
├── index.html
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── styles.css
└── README.md
```

## Alcance previsto

La plataforma incorporará un catálogo de habitaciones, cotizaciones, formularios de solicitud, acceso de clientes, un panel administrativo, tarifas y contenido en cinco idiomas. El desarrollo no considera pagos en línea ni sincronización automática de disponibilidad con Booking.

## Autor

Angel Jose Ignacio Bruzzese Araya — Proyecto de Título, IPLACEX.
