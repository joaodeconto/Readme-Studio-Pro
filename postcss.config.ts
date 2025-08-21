import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import type { Plugin } from 'postcss';

const config = {
  plugins: [tailwindcss, autoprefixer],
} satisfies { plugins: Plugin[] };

export default config;
