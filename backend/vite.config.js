"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));
// https://vitejs.dev/config/
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    resolve: {
        alias: {
            '@': path_1.default.resolve(__dirname, './src'),
        },
        // Configuração específica para standardized-audio-context
        dedupe: ['standardized-audio-context']
    },
    optimizeDeps: {
        // Forçar pré-bundling de dependências problemáticas
        include: ['standardized-audio-context'],
        exclude: []
    },
    build: {
        rollupOptions: {
            // Configuração específica para módulos problemáticos
            external: (id) => {
                // Se standardized-audio-context causar problemas, tratar como externo
                if (id.includes('standardized-audio-context') && id.includes('backup-offline')) {
                    return true;
                }
                return false;
            }
        }
    },
    define: {
        // Definir variáveis globais se necessário
        global: 'globalThis',
    }
});
