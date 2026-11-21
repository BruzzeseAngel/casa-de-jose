// Helpers puros para verificar configuración y explicar errores de autenticación.
export const FIREBASE_REQUIRED = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

export function revisarConfiguracionFirebase(env) {
  if (env.VITE_DEMO_MODE !== 'false') return { modo: 'demo', faltantes: [] };
  const faltantes = FIREBASE_REQUIRED.filter(clave => !String(env[clave] ?? '').trim());
  return { modo: faltantes.length ? 'incompleto' : 'firebase', faltantes };
}

// Evita mostrar detalles internos del proveedor al usuario final.
export function codigoAcceso(error) {
  const codigos = {
    'auth/invalid-email': 'email',
    'auth/email-already-in-use': 'registered',
    'auth/weak-password': 'weak',
    'auth/invalid-credential': 'credentials',
    'auth/wrong-password': 'credentials',
    'auth/user-not-found': 'credentials',
    'auth/too-many-requests': 'throttle',
    'auth/network-request-failed': 'network',
    'auth/operation-not-allowed': 'method',
    'auth/unauthorized-domain': 'domain',
  };
  return codigos[error?.code] ?? 'generic';
}
