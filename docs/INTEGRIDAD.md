# Auditoría de integridad — Cierre de la integración en GitHub

**Referencia:** `Proyecto(2).zip` (la copia definitiva que incorpora Comentarios opcionales y la corrección de la pantalla de cotización).

**GitHub inspeccionado:** `BruzzeseAngel/casa-de-jose`, rama `main`, commit `a93d94b98c6cd86fb836203143f6ae08c093062d` (parche 09).

## Resultado

- Se verificó la presencia de **62 archivos del proyecto fuente** destinados a publicación, excluido `.gitignore` por su adaptación deliberada. Sus identificadores Git (SHA-1 de blob) coinciden con los del ZIP fuente.
- El `.gitignore` de GitHub difiere intencionalmente: protege dependencias, compilaciones, archivos locales y secretos. **El cambio no modifica el comportamiento de la aplicación.**
- El `README.md` de GitHub ha sido reorganizado: es documentación, no código funcional.
- No hay archivos experimentales antiguos tales como `AdminRooms.jsx`, `CatalogContext.jsx`, `catalogFirestore.js` ni rutas de solicitudes ficticias de etapas intermedias en el árbol actual de `main`.
- Los recursos no publicados del ZIP (archivos `.env`, `dist/`, caché `.firebase/`, guías antiguas y respaldos) no son necesarios para la equivalencia del **código fuente**.
- El proyecto fuente contiene documentos adicionales de versiones previas. Se prioriza documentación pública actualizada y se evita publicar guías que puedan dar instrucciones de despliegue desfasadas.

## Verificaciones ejecutadas sobre la copia definitiva

| Comprobación | Resultado |
|---|---|
| Pruebas automatizadas de frontend | 35/35 aprobadas |
| Pruebas automatizadas de backend | 21/21 aprobadas |
| Código/archivos Firebase y frontend | Coinciden con ZIP de referencia |
| Compilación con Vite en entorno de auditoría | No ejecutada (dependencias npm ausentes) |
| Integración real con Firebase/Resend | No evaluada aquí |
| Estado de Hosting | No modificado |

## Alcance de este parche 10

Solo `README.md` y nuevos archivos `docs/*.md`. **No incluye ni reemplaza archivos** de `src/`, `functions/`, `tests/`, `scripts/`, reglas ni configuración Firebase.

Tras aplicar este parche y aprobar `npm test` y `npm run build` localmente, el repositorio estará cerrado a nivel de publicación de código. El entorno Firebase y las evidencias académicas deben verificarse por separado.
