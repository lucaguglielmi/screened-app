import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Determine commit hash and build time
let commitSha = 'dev';
try {
  commitSha =
    process.env.COMMIT_SHA || execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
} catch {
  commitSha = process.env.COMMIT_SHA || 'unknown';
}

const buildTime = new Date().toISOString();
const appVersion = '0.1.0';

// Custom plugin to generate version.json on build and dev
function versionGeneratorPlugin() {
  const versionData = {
    version: appVersion,
    commitSha,
    buildTime,
    timestamp: Date.now(),
  };

  return {
    name: 'version-generator',
    buildStart() {
      const publicDir = path.resolve(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(
        path.resolve(publicDir, 'version.json'),
        JSON.stringify(versionData, null, 2),
      );
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify(versionData, null, 2),
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(buildTime),
    __COMMIT_SHA__: JSON.stringify(commitSha),
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [react(), tailwindcss(), versionGeneratorPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/healthz': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
