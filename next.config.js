const withPWA = require('next-pwa');
const withPlugins = require('next-compose-plugins');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})
// var DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
const path = require('path');
// const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = withPlugins(
    [
      [withBundleAnalyzer],
      [withPWA, {
        pwa: {
          disable: process.env.NODE_ENV !== 'production',
          dest: 'public',
          register: true,
          sw: 'service-worker.js',
        }
      }],
    ],
    {
        webpack: (config, options) => {
          /* config.module.rules.push({
            test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: '[name].[ext]',
                  // outputPath: 'src/fonts/',
                },
              },
            ],
          }) */
          // config.plugins.push(new MomentLocalesPlugin())
          // config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),)
          // config.plugins.push(new webpack.NormalModuleReplacementPlugin(
          //   /moment-timezone\/data\/packed\/latest\.json/,
          //   require.resolve('./misc/timezone-definitions')
          // ),)
          // config.plugins.push(new DuplicatePackageCheckerPlugin())
          config.resolve.alias['@babel/runtime'] = path.resolve(
            __dirname,
            'node_modules',
            '@babel/runtime',
          )
          config.resolve.alias['strip-ansi'] = path.resolve(
            __dirname,
            'node_modules',
            'strip-ansi',
          )
          return config
        },
      }
);
