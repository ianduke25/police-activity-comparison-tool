import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/police-activity-comparison-tool/',   // <-- EXACT repo name
})
