const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common');

const umdLibrary = {
  type: 'umd',
  name: 'SakanaWidget',
  export: 'default',
  umdNamedDefine: true,
};

module.exports = merge(common, {
  mode: 'development',
  entry: path.resolve(__dirname, '../src/index.ts'),
  output: {
    path: path.resolve(__dirname, '../lib'),
    library: umdLibrary,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../public/index.html'),
    }),
  ],
  devServer: {
    allowedHosts: 'all',
  },
});
