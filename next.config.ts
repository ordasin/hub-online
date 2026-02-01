import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Si tu repo de GitHub no es tu dominio principal (ej: ordasin.github.io/developer903/)
  // descomenta las siguientes líneas y pon el nombre de tu repositorio:
  // basePath: '/developer903',
  // assetPrefix: '/developer903',
};

export default nextConfig;