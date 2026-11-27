# Guía de pruebas y validación

Esta guía describe los procedimientos de ejecución de pruebas automatizadas y verificaciones funcionales de la plataforma. Su finalidad es facilitar la reproducción de las pruebas, la identificación de errores y la validación de futuras modificaciones del sistema. Los resultados académicos y sus evidencias se encuentran documentados en el informe del Proyecto de Título.

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

Los resultados de las pruebas automatizadas documentadas en el informe del Proyecto de Título son los siguientes:

| Grupo | Aprobadas | Fallidas |
|---|---:|---:|
| Frontend (`node:test`) | 35 | 0 |
| Backend (`node:test`) | 21 | 0 |
| **Total** | **56** | **0** |

Las pruebas automatizadas verifican funciones específicas de la lógica de aplicación y del servidor. De manera complementaria, se debe comprobar la compilación mediante `npm run build` y realizar las verificaciones funcionales correspondientes cuando se introduzcan cambios en el código.

## Lista de comprobación para futuras modificaciones

La siguiente lista constituye una guía reutilizable para verificar el funcionamiento de la plataforma después de incorporar modificaciones. No representa el estado de ejecución de los casos de prueba académicos CP-01 a CP-14, cuyos resultados se encuentran documentados en el Anexo D del informe. Se deben utilizar cuentas y registros de prueba, evitando exponer información personal.

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
