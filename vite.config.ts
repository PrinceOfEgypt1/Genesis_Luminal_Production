import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
export default defineConfig({
plugins: [
react({
babel: {
plugins: [
// Otimizações de produção
['babel-plugin-transform-react-remove-prop-types', { removeImport: true }]
]
}
})
],
resolve: {
alias: {
'@': resolve(__dirname, 'src'),
},
},
server: {
port: 3000,
open: true,
},
build: {
target: 'es2020',
minify: 'terser',
rollupOptions: {
output: {
manualChunks: {
vendor: ['react', 'react-dom'],
three: ['three'],
utils: ['mathjs']
}
}
},
terserOptions: {
compress: {
drop_console: false, // Manter console.log para debug
drop_debugger: true,
pure_funcs: ['console.warn', 'console.error']
}
}
},
optimizeDeps: {
include: ['react', 'react-dom', 'three'],
exclude: ['@tensorflow/tfjs']
}
})
