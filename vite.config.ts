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
  resolve: {
    alias: {
      '#components': resolve(__dirname, 'components'),
      '#constants': resolve(__dirname, 'constants'),
      '#store': resolve(__dirname, 'store'),
      '#hoc': resolve(__dirname, 'hoc'),
      '#windows': resolve(__dirname, 'windows'),
      // this helps us import files from any location in the project without using relative paths
    },
  },
})
