import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import App from './App';
import './styles.css';
// Los proveedores comparten sesión, idioma y moneda con todas las rutas de la aplicación.
createRoot(document.getElementById('root')).render(<React.StrictMode>
  <BrowserRouter>
    <LanguageProvider>
      <CurrencyProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </CurrencyProvider>
    </LanguageProvider>
  </BrowserRouter>
</React.StrictMode>);
