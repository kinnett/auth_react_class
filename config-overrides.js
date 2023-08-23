const fs = require('fs');

module.exports = function override(config, env) {
  if (!config.devServer) {
    config.devServer = {};
  }

  config.devServer.https = {
    pfx: fs.readFileSync('./localhost.pfx'),
    passphrase: 'pc1sp@assword',
  };

  return config;
};
