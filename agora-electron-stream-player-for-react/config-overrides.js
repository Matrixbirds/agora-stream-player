const {
  override,
  addWebpackExternals
} = require('customize-cra');

module.exports = {
  webpack: override(
    (config) => {
      config.externals = {"agora-electron-sdk": "commonjs2 agora-electron-sdk"};
      // console.log(config.externals)
      return config;
    }
  )
}