const path = require('path');
const ForkTsCheckWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const autoprefixer = require('autoprefixer');
const TerserJsPlugin = require('terser-webpack-plugin')

module.exports = (env, argv) => {

  const production = (env && env.production) || (argv && argv.mode == 'production') ? true : false;
  console.log('Environment:', (production ? 'Production' : 'Development') + '!')
return {
  mode: production ? 'production' : 'development',
  entry: {
    'bs-ext-background': path.resolve(__dirname, 'src', 'background', 'background.ts'),
    'bs-ext-main': path.resolve(__dirname, 'src', 'main', 'main.ts'),
    'bs-ext-auth': path.resolve(__dirname, 'src', 'auth', 'main.ts'),
    'bs-ext-popup': path.resolve(__dirname, 'src', 'popup', 'main.ts')
  },

  output: {
    path: path.resolve(__dirname, production ? 'build-prod' : 'build'),
    filename: '[name].js',
  },

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.[jt]s$/,
        loader: 'ts-loader',
        options: { transpileOnly: true }
      },
      {
        test: /\.scss$/,
        use: [
          !production ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { importLoaders: 1 } },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [ autoprefixer() ]
            }
          },
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          !production ? 'vue-style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.(ttf|eot|svg|woff2?)(\?[a-z0-9=&.]+)?$/,
        loader: 'file-loader'
      }
    ]
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.vue', '.ts', '.js', '.json', '.html', '.scss', '.css'],
    plugins: [new TsConfigPathsPlugin()]
  },

  devtool: production ? '' : 'inline-source-map',

  optimization: {
    splitChunks: {
      chunks: 'all'
    },
    minimizer: [ new TerserJsPlugin({ terserOptions: { mangle: { reserved: [
                'Buffer',
                'BigInteger',
                'Point',
                'ECPubKey',
                'ECKey',
                'sha512_asm',
                'asm',
                'ECPair',
                'HDNode'
            ] } } }) ]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    // new ForkTsCheckWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      chunks: ['bs-ext-main'],
      template: 'src/main/index.html',
      filename: 'main.html'
    }),
    new HtmlWebpackPlugin({
      chunks: ['bs-ext-auth'],
      template: 'src/auth/index.html',
      filename: 'auth.html'
    }),
    new HtmlWebpackPlugin({
      chunks: ['bs-ext-popup'],
      template: 'src/popup/index.html',
      filename: 'popup.html'
    }),
    new HtmlWebpackPlugin({
      chunks: ['bs-ext-background'],
      template: 'src/background/index.html',
      filename: 'background.html'
    }),
    new CopyWebpackPlugin([
      { from: 'src/*', flatten: true },
      { from: 'src/assets', to: 'assets' }
    ])
  ]
}
}
