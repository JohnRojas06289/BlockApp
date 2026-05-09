module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Transforma los imports de .sql en string literals antes de que
      // Metro intente parsearlos como JavaScript
      ['inline-import', { extensions: ['.sql'] }],
    ],
  };
};
