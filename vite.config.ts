import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This is needed because the Google GenAI SDK and some other libs
    // expect 'process.env' to exist, but browsers don't have it.
    'process.env': {}
  }
})
