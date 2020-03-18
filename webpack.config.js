const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        index: ['webpack-hot-middleware/client?noInfo=true&reload=true', './src/index.js'],
        pageA: ['webpack-hot-middleware/client?noInfo=true&reload=true', './src/pages/page-a/index.js'],
        pageB: ['webpack-hot-middleware/client?noInfo=true&reload=true', './src/pages/page-b/index.js']
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: ''
    },
    mode: 'development',
    // devtool: 'cheap-source-map',
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
                    // 'style-loader',
                    MiniCSSExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                    'postcss-loader'
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
        new MiniCSSExtractPlugin({
            filename: '[name].css'
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './src/static/index.html',
            chunks: 'index'
        }),
        new HtmlWebpackPlugin({
            filename: 'pageA.html',
            template: './src/static/index.html',
            chunks: 'pageA'
        }),
        new HtmlWebpackPlugin({
            filename: 'pageB.html',
            template: './src/static/index.html',
            chunks: 'pageB'
        }),
        new webpack.HotModuleReplacementPlugin(),
    ],
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /(react|react-dom)/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
    },
    stats: {
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }
}