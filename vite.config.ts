import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
          entry: 'src/index.ts', // Entry file for your library
          name: 'supakit-eloquent', // The global variable name in UMD builds
          fileName: (format) => `supakit-eloquent.${format}.js`
        },
    },
    test: {
      coverage: {
        enabled: true,
        exclude: [
          'tests/**/*.{ts,tsx}', 
          'node_modules/**/*.{ts,tsx}', 
          'dist/**/*.{ts,tsx}',
          'src/**/*.{ts,tsx}',
          'supakit-eloquent*',
          'types/**/*.{ts,tsx}'
        ],

      },
      include: ['tests/**/*.{ts,tsx}'],
    },
});