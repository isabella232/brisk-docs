const path = require('path');

const webpack = config => {
  config.resolve.modules.push(path.join(__dirname, 'packages'));

  return config;
};

module.exports = () => ({
  packages: path.join(__dirname, 'packages', '*'),
  docs: { path: path.join(__dirname, 'docs'), name: 'docs' },
  siteName: 'Webpack Test Docs',
  webpack,
});
