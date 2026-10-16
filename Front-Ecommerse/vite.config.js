import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El CORS del back solo admite http://localhost:5173: si Vite cae en otro puerto, las llamadas fallan en silencio.
// strictPort lo convierte en un error claro (también en `vite preview`).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
})
