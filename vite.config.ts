import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }), tailwindcss()
  ],
  server: {
    allowedHosts: ['loreless-muoi-whimsically.ngrok-free.dev'],
  },
  resolve: {
    alias: {
      '#components': resolve(__dirname, 'src/components'),
      '#constants': resolve(__dirname, 'src/constants'),
      '#store': resolve(__dirname, 'src/store'),
      '#hoc': resolve(__dirname, 'src/hoc'),
      '#windows': resolve(__dirname, 'src/windows'),
      // this helps us import files from any location in the project without using relative paths
    },
  },
})
