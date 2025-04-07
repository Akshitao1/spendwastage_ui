const path = require('path');
const Dotenv = require('dotenv-webpack');

// Monkey patch util._extend to suppress deprecation warning
// This is only needed until all dependencies stop using it
const util = require('util');
if (util._extend) {
  const originalExtend = util._extend;
  Object.defineProperty(util, '_extend', {
    enumerable: false,
    value: function(target, source) {
      return Object.assign(target, source);
    }
  });
}

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new Dotenv({
      systemvars: true, // Load all system environment variables as well
    }),
  ],
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
  },
}; 