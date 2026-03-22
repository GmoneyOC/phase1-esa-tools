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
            name: 'copy-static-assets',
            closeBundle() {
                // Copy templates directory
                const templatesSrc = resolve(__dirname, 'public/templates');
                const templatesDest = resolve(__dirname, 'build/templates');
                if (existsSync(templatesSrc)) {
                    cpSync(templatesSrc, templatesDest, { recursive: true });
                }
                // Copy PWA assets (service worker, manifest, icons)
                const swSrc = resolve(__dirname, 'public/sw.js');
                const swDest = resolve(__dirname, 'build/sw.js');
                if (existsSync(swSrc)) {
                    cpSync(swSrc, swDest);
                }
                const manifestSrc = resolve(__dirname, 'public/manifest.json');
                const manifestDest = resolve(__dirname, 'build/manifest.json');
                if (existsSync(manifestSrc)) {
                    cpSync(manifestSrc, manifestDest);
                }
                const iconsSrc = resolve(__dirname, 'public/icons');
                const iconsDest = resolve(__dirname, 'build/icons');
                if (existsSync(iconsSrc)) {
                    cpSync(iconsSrc, iconsDest, { recursive: true });
                }
            }
        }
    ]
});
