import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'], // รวม React และ libraries หลัก
          framer: ['framer-motion'], // แยก Framer Motion
          axios: ['axios'], // แยก Axios
          swal: ['sweetalert2'], // แยก SweetAlert2
        },
      },
    },
  },
});