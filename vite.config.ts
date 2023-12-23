import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
          entry: 'src/index.ts', // Entry file for your library
          name: 'supakit-eloquent', // The global variable name in UMD builds
          fileName: (format) => `supakit-eloquent.${format}.js`
        },
    }
});