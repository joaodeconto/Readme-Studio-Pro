import type { NextConfig } from 'next';
import path from "path";

const nextConfig = module.exports = {
  // this includes files from the monorepo base two directories up
  outputFileTracingRoot: path.join(__dirname, '../../'),
}

const nextConfigOld: NextConfig = {
    images: {
        domains: ["meu-cdn.com"]
    }

};

export default nextConfig;
