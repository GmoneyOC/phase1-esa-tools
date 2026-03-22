import { defineConfig } from 'vite';
import { resolve } from 'path';
import { cpSync, existsSync } from 'fs';

export default defineConfig({
    root: 'public',
    publicDir: false,
    build: {
        outDir: resolve(__dirname, 'build'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'public/index.html'),
                generator: resolve(__dirname, 'public/generator.html'),
                dashboard: resolve(__dirname, 'public/dashboard.html')
            }
        }
    },
    server: {
        open: true
    },
    plugins: [
        {
            name: 'copy-templates',
            closeBundle() {
                const src = resolve(__dirname, 'public/templates');
                const dest = resolve(__dirname, 'build/templates');
                if (existsSync(src)) {
                    cpSync(src, dest, { recursive: true });
                }
            }
        }
    ]
});
