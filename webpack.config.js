/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',

  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/ui.ts', // The entry point for your UI code
    plugin: './src/plugin.ts' // The entry point for your plugin code
  },

  module: {
    rules: [
      // Converts TypeScript code to JavaScript
      {test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/},

      // Enables including CSS by doing "import './file.css'" in your TypeScript code
      {test: /\.css$/, use: ['style-loader', 'css-loader']},

      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      {test: /\.(png|jpg|gif|svg|webp)$/, type: 'asset/inline'}
    ]
  },

  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: {extensions: ['.tsx', '.ts', '.jsx', '.js']},

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist') // Compile into a folder called "dist"
  },

  // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/ui.html',
      filename: 'ui.html',
      inlineSource: '.(js)$',
      chunks: ['ui'],
      cache: false
    }),
    new HtmlInlineScriptPlugin([/ui.js/])
  ]
});
