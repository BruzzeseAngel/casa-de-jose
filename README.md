# La Casa de José — Plataforma web multilingüe

Proyecto de Título de Ingeniería en Informática, IPLACEX (2026). Canal complementario para el Hostal La Casa de José, San Pedro de Atacama, Chile. **Una solicitud no equivale a una reserva confirmada**: la disponibilidad se revisa manualmente con el hostal y Booking.

## Estado del repositorio: integración progresiva v0.7.0

Este repositorio publica por módulos una implementación ya elaborada del proyecto de título. Las fechas de integración a GitHub no representan necesariamente las fechas de desarrollo original del código.

### Funcionalidades disponibles

- Portada, catálogo, fichas de habitaciones, servicios y selector de idiomas (ES/EN/PT/DE/FR).
- Cotizaciones orientativas de demostración con cálculo de noches, subtotal neto, IVA del 19 % y total.
- Solicitudes **ficticias** almacenadas temporalmente en la pestaña mediante `sessionStorage`, sin guardar datos de contacto.
- Firebase Authentication: registro, inicio/cierre de sesión y recuperación de contraseña (en modo Firebase).
- Lectura pública de habitaciones, servicios y tarifas desde Cloud Firestore, con carga y errores controlados.
- **Nuevo v0.7:** panel `/administracion` para gestionar habitaciones: crear, visualizar (incluidas desactivadas), editar, retirar del catálogo y restaurar.
- La eliminación de habitaciones es **lógica** (`activa=false`); se conservan documentos, fotografías, tarifas y referencias históricas.
- El catálogo público se recarga después de cambios administrativos en la misma sesión.
- 5 idiomas para la web pública. El módulo administrativo de esta etapa está en español.

### Qué no está incorporado aún

La gestión de fotografías con Firebase Storage, el CRUD de servicios y tarifas, la persistencia de solicitudes reales, el historial administrativo y las Cloud Functions del proyecto completo se integrarán en futuras etapas. La página `/mis-solicitudes` sigue siendo informativa. No se realizan pagos ni se sincroniza automáticamente la disponibilidad con Booking.

## Dos modos de funcionamiento

**Demostración** (predeterminado, `VITE_DEMO_MODE=true` o ausente): se muestran habitaciones, tarifas y servicios ilustrativos. `/administracion` ofrece una **vista informativa de solo lectura**; no permite escrituras ni cuentas reales.

**Firebase** (`VITE_DEMO_MODE=false` con variables públicas correctas): lee Firestore, habilita Authentication y permite la administración únicamente con una sesión cuyo token tenga `admin: true` como **custom claim verificada por Firebase**. Un usuario cliente no puede acceder al módulo. El rol **no** se obtiene de una variable local ni se asigna desde la interfaz.

**Seguridad crítica:** la navegación protegida NO sustituye a las reglas del servidor. Antes de usar el panel con datos reales, las reglas de Firestore deben permitir `create/update/delete` de `/habitaciones/{habitacionId}` **solo** si `request.auth.token.admin == true`. Los clientes solo deben leer habitaciones activas; las tarifas siguen siendo de solo lectura pública según las reglas del proyecto. **Este parche no despliega ni reemplaza reglas**. Nunca uses `allow read, write: if true`.

Las custom claims deben otorgarse desde un entorno administrativo confiable mediante Firebase Admin SDK, nunca desde la aplicación web. Si un usuario recibe la claim estando conectado, deberá renovar su token (por ejemplo, cerrando sesión y volviendo a entrar). No guardes service accounts ni credenciales privadas en GitHub.

## Modelo de habitaciones utilizado

```text
/habitaciones/{habitacionId}
  nombre: string
  capacidad: number
  stockTotal: number
  tamanoM2: number
  camas: string[]
  comodidades: string[]
  fotos: string[]
  activa: boolean
  /tarifas/{tarifaId}   # Solo lectura en esta etapa
```

Una categoría nueva comienza con `activa=false` por precaución. El campo `fotos` se conserva al editar y no se sobrescribe, pero todavía no se suben nuevas fotografías desde el panel. La operación «Eliminar» usa una baja lógica reversible.

## Instalación

Requiere **Node.js >=20.19** y npm.

```bash
npm ci
npm test
npm run build
npm run dev
```

La vista local suele abrir en `http://127.0.0.1:5173`.

Para activar Firebase, copia `.env.example` a `.env` en la raíz y define `VITE_DEMO_MODE=false` con los parámetros web `VITE_FIREBASE_*`. **No subas `.env`**: las variables `VITE_*` se exponen al navegador y no deben contener secretos.

### Comprobaciones sugeridas

1. En demo: abre `/administracion`; debe mostrar habitaciones ficticias y botones deshabilitados.
2. En modo Firebase, con usuario corriente: comprueba que `/administracion` muestra «Acceso restringido».
3. Con una cuenta con claim `admin=true`: abre `/administracion`, crea una habitación de prueba inicialmente **inactiva**, edítala y comprueba los cambios.
4. Activa la categoría; confirma que aparece en `/habitaciones`. Luego elimínala lógicamente y verifica que desaparece del catálogo público pero continúa disponible para restaurarla en Administración.
5. Comprueba que las tarifas antiguas no se eliminan y que el formulario sigue mostrando sus fotografías existentes.
6. **Evita cambios sobre registros reales** hasta revisar las reglas de seguridad y disponer de respaldo.

Las pruebas `node:test` cubren datos y validaciones, pero no sustituyen la verificación manual del SDK de Firebase, las reglas desplegadas ni la interfaz real.

## Estructura relevante

```text
src/
  pages/AdminRooms.jsx          # Panel de habitaciones (v0.7)
  components/AdminRoute.jsx     # Restricción de acceso administrativo
  context/AuthContext.jsx      # Sesión y custom claim admin
  context/CatalogContext.jsx   # Catálogo público y recarga
  lib/adminRoomsFirestore.js   # Lecturas/escrituras del panel
  lib/adminRoomsModel.mjs      # Validación y normalización
  lib/catalogFirestore.js      # Lectura pública (v0.6)
tests/adminRoomsModel.test.mjs  # Pruebas unitarias del módulo
```

## Autor

Angel Jose Ignacio Bruzzese Araya — Proyecto de Título, IPLACEX.
