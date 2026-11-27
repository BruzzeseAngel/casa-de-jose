# Integridad y verificación del proyecto

## Objetivo

El presente documento describe los criterios de integridad, organización y validación técnica del código fuente de la plataforma web del Hostal La Casa de José.

## Componentes del repositorio

El repositorio contiene los siguientes elementos necesarios para el desarrollo y mantenimiento de la aplicación:

- Código fuente del frontend desarrollado con React.
- Funciones de procesamiento protegido mediante Firebase Cloud Functions.
- Reglas de seguridad de Cloud Firestore y Firebase Storage.
- Configuración de índices de Cloud Firestore.
- Archivos de configuración de Firebase Hosting.
- Pruebas automatizadas de la aplicación y del backend.
- Archivos de dependencias y documentación técnica.

## Resultados de validación

| Comprobación | Resultado documentado |
|---|---|
| Pruebas automatizadas de la aplicación | 35 aprobadas |
| Pruebas automatizadas del backend | 21 aprobadas |
| Total de pruebas automatizadas | 56 aprobadas, 0 fallidas |
| Casos de prueba manuales | 14 aprobados dentro de los escenarios examinados |
| Publicación mediante HTTPS | Verificada |
| Acceso con perfil cliente y administrador | Verificado |

Los resultados corresponden a las verificaciones académicas documentadas en el informe del Proyecto de Título. Las pruebas deben ejecutarse nuevamente cuando se incorporen modificaciones funcionales al código fuente.

## Verificación de la integridad

Para mantener la consistencia del proyecto se recomienda:

- Comprobar los cambios mediante Git antes de incorporarlos al repositorio.
- Ejecutar las pruebas automatizadas de la aplicación y del backend.
- Verificar la compilación del frontend mediante `npm run build`.
- Revisar las reglas de seguridad y los índices de Firestore.
- Comprobar el funcionamiento de las funcionalidades modificadas.
- Confirmar la correspondencia entre el código publicado y la versión desplegada.

## Protección de información sensible

El repositorio no debe contener credenciales privadas, secretos de servicios externos, archivos de entorno con información sensible ni datos personales de huéspedes.

El archivo `.gitignore` excluye las dependencias instaladas, los archivos de compilación y otros recursos locales que no requieren formar parte del control de versiones.

## Alcance de las verificaciones

Las pruebas documentadas respaldan los escenarios funcionales examinados, pero no constituyen una certificación integral de seguridad, rendimiento o calidad del software.

La configuración operativa de Firebase, los registros de la base de datos, las cuentas de usuario y los archivos almacenados en Storage deben administrarse de manera independiente del repositorio de código fuente.