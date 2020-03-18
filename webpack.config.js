const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: ['webpack-hot-middleware/client?noInfo=true&reload=true', './src/index.js'],
    output: {
        filename: 'boundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: ''
    },
    mode: 'development',
    devtool: 'cheap-source-map',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: [
                    'babel-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png||jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            outputPath: 'images',
                            limit: 8192
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new FriendlyErrorsPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/static/index.html'
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    stats: {
        modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }
}