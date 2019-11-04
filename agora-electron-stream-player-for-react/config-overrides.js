const {
  override,
  addWebpackExternals
} = require('customize-cra');

module.exports = {
  webpack: override(
    addWebpackExternals({
      "agora-electron-sdk": "commonjs2 agora-electron-sdk",
      AgoraRTCEngine: "commonjs2 agora-electron-sdk"
    })
  )
}