import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite construye el front-end y deja los archivos terminados en /dist.
export default defineConfig({ plugins: [react()] });
