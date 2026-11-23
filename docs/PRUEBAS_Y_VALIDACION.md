# Guía de pruebas y validación

Esta guía distingue **pruebas automáticas ejecutadas** de **verificaciones manuales pendientes**. No constituye evidencia de que se hayan realizado pruebas reales contra Firebase o el sitio alojado.

## Pruebas automáticas

En la raíz del repositorio:

```powershell
npm ci
npm test
npm run build
```

En el directorio de funciones:

```powershell
cd functions
npm ci
npm test
cd ..
```

Durante la auditoría de cierre se ejecutaron sobre una copia limpia del ZIP fuente:

| Grupo | Aprobadas | Fallidas |
|---|---:|---:|
| Frontend (`node:test`) | 35 | 0 |
| Backend (`node:test`) | 21 | 0 |
| **Total** | **56** | **0** |

**Limitación:** no se ejecutó `npm run build` en el entorno de auditoría porque no estaban instaladas las dependencias npm. Debe comprobarse en la máquina de trabajo antes de declarar la compilación validada.

## Lista de verificación manual

Utiliza cuentas y registros de prueba. No compartas información personal en capturas públicas.

- [ ] La compilación `npm run build` finaliza sin errores.
- [ ] Inicio, habitaciones, servicios, detalle y navegación funcionan en computador y móvil.
- [ ] Los cinco idiomas muestran las etiquetas previstas.
- [ ] La cotización calcula noches, cantidades, neto, IVA y total conforme a las tarifas de prueba.
- [ ] El selector de divisas se indica como **referencial**.
- [ ] El formulario admite comentarios vacíos y mensajes de hasta 500 caracteres.
- [ ] Al enviar una solicitud de prueba, el campo `comentarios` queda almacenado correctamente en Firestore.
- [ ] El comentario aparece en administración, «Mis solicitudes» y el correo administrativo cuando está habilitado.
- [ ] Una cuenta cliente no puede entrar al panel `/admin` ni modificar datos de negocio.
- [ ] Las reglas Firestore y Storage bloquean escrituras no autorizadas, comprobadas mediante pruebas de permisos.
- [ ] El administrador puede crear, editar, desactivar y restaurar una habitación de prueba.
- [ ] El administrador puede modificar tarifas y consultar el historial de solicitudes.
- [ ] La subida, orden y eliminación de fotografías de prueba funcionan en Storage.
- [ ] La solicitud permanece pendiente hasta revisión de disponibilidad por el hostal.
- [ ] Se verifica el envío del correo y el tratamiento de fallos de Resend.
- [ ] Se revisa el destino de Firebase Hosting **antes** de cualquier despliegue.

## Registro de evidencias

Para cada caso funcional del plan de pruebas vigente en el informe académico registra: identificador, fecha, precondición, pasos, resultado esperado, resultado observado, estado, captura o salida de consola y observaciones. No atribuyas a esta lista resultados que aún no se hayan medido.

## Manejo de errores

Si una prueba falla, conserva el mensaje completo de consola, el nombre del archivo y el comando que ejecutaste. Para errores en producción, distingue problemas de carga del frontend, permisos de Firebase, fallas de funciones y rechazo del servicio de correo. No modifiques reglas de acceso para resolver un error sin revisar su alcance.
