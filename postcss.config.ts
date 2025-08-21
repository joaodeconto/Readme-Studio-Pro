import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import type { Plugin } from 'postcss';

const config = {
  plugins: [tailwindcss, autoprefixer],
} satisfies { plugins: Plugin[] };

export default config;
