const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const enableWebIsolation = process.env.EXPO_ENABLE_WEB_ISOLATION === '1';

// .sql — babel-plugin-inline-import lo convierte a string antes de que
// Metro lo procese, así nunca intenta parsearlo como JS.
config.resolver.assetExts.push('sql');

// .wasm — expo-sqlite usa WebAssembly en web (wa-sqlite).
// Debe ir en assetExts para que Metro lo sirva como binario, no como JS.
config.resolver.assetExts.push('wasm');

// Cross-origin isolation (COOP/COEP) es útil solo si realmente usamos
// SharedArrayBuffer / expo-sqlite en web. Hoy la app web usa stubs y datos
// en memoria, así que dejar estos headers activos rompe imágenes remotas
// (p. ej. íconos de CoinGecko) durante el desarrollo.
//
// Si en el futuro activamos persistencia real con expo-sqlite en web, se puede
// volver a encender con: EXPO_ENABLE_WEB_ISOLATION=1
if (enableWebIsolation) {
  config.server = {
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
        middleware(req, res, next);
      };
    },
  };
}

module.exports = config;
