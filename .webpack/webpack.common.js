module.exports = {
  devtool: 'source-map',
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|ts|jsx|tsx)$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          target: 'es2015',
        },
      },
      {
        test: /\.(sass|scss|css)$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.svg$/,
        type: 'asset/source',
        use: ['svgo-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/inline',
      },
    ],
  },
};
