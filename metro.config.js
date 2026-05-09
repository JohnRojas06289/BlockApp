const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// .sql — babel-plugin-inline-import lo convierte a string antes de que
// Metro lo procese, así nunca intenta parsearlo como JS.
config.resolver.assetExts.push('sql');

// .wasm — expo-sqlite usa WebAssembly en web (wa-sqlite).
// Debe ir en assetExts para que Metro lo sirva como binario, no como JS.
config.resolver.assetExts.push('wasm');

// SharedArrayBuffer es requerido por expo-sqlite en web (wa-sqlite threading).
// Los navegadores lo bloquean sin estos dos headers de seguridad.
// enhanceMiddleware los inyecta en cada respuesta del servidor de desarrollo.
config.server = {
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      middleware(req, res, next);
    };
  },
};

module.exports = config;
