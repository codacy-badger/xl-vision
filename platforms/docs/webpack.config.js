/* eslint-disable import/no-extraneous-dependencies */
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

const isProd = process.env.NODE_ENV === 'production'

const imageInlineSizeLimit = 10000

const publicPath = isProd ? '/xl-vision/' : '/'

const envsDefinitions = {
  PUBLIC_PATH: publicPath,
  NODE_ENV: isProd ? 'production' : 'development'
}

const envs = {}

Object.keys(envsDefinitions).forEach((key) => {
  const newKey = `process.env.${key}`
  envs[newKey] = JSON.stringify(envsDefinitions[key])
})

const babelConfig = {
  presets: [
    [
      '@babel/preset-env',
      {
        bugfixes: true,
        shippedProposals: true,
        modules: false
      }
    ],
    '@babel/preset-react',
    '@babel/preset-typescript'
  ],
  plugins: [
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: true
      }
    ]
  ]
}

module.exports = {
  mode: isProd ? 'production' : 'development',
  bail: isProd,
  devtool: isProd ? 'source-map' : 'cheap-module-source-map',
  entry: path.resolve(__dirname, 'src/index.tsx'),
  output: {
    path: isProd ? path.resolve(__dirname,'dist') : undefined,
    pathinfo: !isProd,
    filename: isProd ? 'static/js/[name].[contenthash:8].js' : 'static/js/[name].js',
    chunkFilename: isProd
      ? 'static/js/[name].[contenthash:8].chunk.js'
      : 'static/js/[name].chunk.js',
    publicPath
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.mdx'],
    alias: {
      'react-native': 'react-native-web'
      // 'react-dom$': 'react-dom'
    }
  },
  optimization: {
    minimize: isProd,
    minimizer: [
      // This is only used in production mode
      new TerserPlugin({
        terserOptions: {
          parse: {
            // We want terser to parse ecma 8 code. However, we don't want it
            // to apply any minification steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            // https://github.com/facebook/create-react-app/pull/4234
            ecma: 8
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            // https://github.com/facebook/create-react-app/issues/2376
            // Pending further investigation:
            // https://github.com/mishoo/UglifyJS2/issues/2011
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            // https://github.com/facebook/create-react-app/issues/5250
            // Pending further investigation:
            // https://github.com/terser-js/terser/issues/120
            inline: 2
          },
          mangle: {
            safari10: true
          },
          // Added for profiling in devtools
          // keep_classnames: true,
          // keep_fnames: true,
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            // https://github.com/facebook/create-react-app/issues/2488
            ascii_only: true
          }
        }
      })
    ]
  },
  module: {
    rules: [
      { parser: { requireEnsure: false } },
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve('url-loader'),
            options: {
              limit: imageInlineSizeLimit,
              name: 'static/media/[name].[hash:8].[ext]'
            }
          },
          {
            test: [/\.jsx?$/, /\.tsx?$/],
            loader: require.resolve('babel-loader'),
            exclude: '/node_modules/',
            options: {
              babelrc: false,
              configFile: false,
              ...babelConfig
            }
          },
          {
            test: [/\.mdx?$/],
            exclude: '/node_modules/',
            use: [
              {
                loader: require.resolve('babel-loader'),
                options: {
                  babelrc: false,
                  configFile: false,
                  ...babelConfig
                }
              },
              {
                loader: require.resolve('@mdx-js/loader'),
                options: {
                  remarkPlugins: [require('./demoPlugin')]
                }
              },
            ]
          }
        ]
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: 'template/index.html',
      ...envsDefinitions,
      ...(isProd
        ? {
            minify: {
              removeComments: true,
              collapseWhitespace: true,
              removeRedundantAttributes: true,
              useShortDoctype: true,
              removeEmptyAttributes: true,
              removeStyleLinkTypeAttributes: true,
              keepClosingSlash: true,
              minifyJS: true,
              minifyCSS: true,
              minifyURLs: true
            }
          }
        : undefined)
    }),
    new ForkTsCheckerWebpackPlugin({
      async: !isProd,
      typescript: {
        mode: 'write-references',
        diagnosticOptions: {
          syntactic: true
        }
      }
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: isProd ? 'dist/public' : '/public'
        }
      ]
    }),
    new webpack.DefinePlugin(envs),
    !isProd && new webpack.HotModuleReplacementPlugin(),
    !isProd && new CaseSensitivePathsPlugin()
  ].filter(Boolean),
  devServer: {
    compress: true
  }
}