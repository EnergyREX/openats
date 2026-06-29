import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    // Fija la raíz del workspace al frontend: un lockfile huérfano en un
    // directorio superior haría que Turbopack vigilase todo ese árbol.
    root: __dirname,
  },
};

export default nextConfig;
