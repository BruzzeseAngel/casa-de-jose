# Seguridad, configuración y publicación

**Advertencia:** la existencia de archivos de configuración en GitHub no autoriza ni garantiza un despliegue seguro. El proyecto de título ya cuenta con un entorno de pruebas; verifica su destino antes de usar la CLI.

## Archivos y secretos

- `.env` en la raíz: contiene parámetros de configuración web de Firebase y opciones locales. Está excluido del repositorio.
- `functions/.env*`: puede contener parámetros del backend; está excluido del repositorio.
- `RESEND_API_KEY`: secreto de servidor de Firebase/Secret Manager. **Nunca** lo incorpores a `VITE_*`, al código fuente ni a GitHub.
- Claves de cuentas de servicio Admin SDK, archivos `.pem`, `.key` y respaldos privados: deben permanecer fuera del repositorio.
- `.env.example`: contiene nombres de variables con valores vacíos y puede versionarse.

Las claves públicas de configuración web **no reemplazan** a las reglas de seguridad. Esas reglas deben validarse en el entorno de Firebase.

## Ejecución de demostración

```powershell
npm ci
npm run dev
```

Sin `.env` o con `VITE_DEMO_MODE=true`, la aplicación funciona en demostración. **No crea solicitudes reales ni escribe datos del hostal**.

## Activación de Firebase real

1. Obtén los parámetros **públicos** desde la configuración de la aplicación web de Firebase.
2. Copia `.env.example` a `.env` y completa únicamente las variables apropiadas. Define `VITE_DEMO_MODE=false`.
3. Comprueba en Firebase Console las instancias de Firestore, Authentication, Storage y las Cloud Functions existentes.
4. Para funciones y correo, configura los parámetros de servidor y el secreto en su ámbito autorizado; no copies archivos privados al repositorio.
5. Comprueba las reglas y permisos con cuentas de prueba y, si corresponde, emuladores.
6. Antes de cualquier despliegue, **verifica explícitamente proyecto y sitio de Hosting**.

## Destino de Hosting que requiere verificación

Los archivos del ZIP fuente asocian el destino lógico `principal` con el sitio `hostal-la-casa-de-jose`. Ese nombre no es el mismo que la URL de pruebas `casa-de-jose-pruebas.web.app` utilizada durante el desarrollo.

Puedes revisar sin desplegar:

```powershell
firebase use
Get-Content .firebaserc
Get-Content firebase.json
```

**No ejecutes `firebase deploy`, `npm run seed` ni `npm run admin` como parte de este parche documental.** Los scripts de carga y promoción administrativa requieren preparación y podrían cambiar datos o permisos reales. Si en el futuro necesitas publicar desde este repositorio, primero acuerda el sitio, compara configuraciones y realiza una prueba controlada.

## Acceso y datos personales

- La cuenta cliente solo debe leer sus propias solicitudes.
- La administración requiere permisos `admin` confiables en Firebase; ocultar botones en React no asegura los datos.
- Las solicitudes y tarifas se escriben desde Cloud Functions según las reglas originales.
- Los comentarios del huésped se limitan a 500 caracteres y se muestran como texto, distintos de las observaciones administrativas.
- No publiques capturas que revelen nombres, correos, teléfonos, tokens de sesión ni documentos privados.

## Elementos que no están contenidos en GitHub

El repositorio publica **código y configuración**, pero no copia los registros reales de Firestore, cuentas Auth, imágenes de Storage, secretos, parámetros del servidor ni el estado del despliegue de Hosting. Por tanto, reproducir el código no equivale a clonar automáticamente el entorno de producción o pruebas.
