const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const merge = require('webpack-merge');
const glob = require('glob');

const baseConfig = require('./webpack.config.base');

const getEntryAndHtml = () => {
    const filePath = glob.sync(path.join(__dirname, '../src/pages/**/*.js'))

    let entrys = {};
    let htmlPlugins = [];

    filePath.forEach(item => {
        const match = item.match(/pages\/(.+)\/index\.js$/);
        const name = match && match[1];

        entrys[name] = ['webpack-hot-middleware/client?noInfo=true&reload=true', item];
        htmlPlugins.push(new HtmlWebpackPlugin({
            filename: `${name}.html`,
            template: path.join(__dirname, '../src/static/index.html'),
            chunks: [name, 'vendors', 'reacts', 'default', 'manifest'],
            inject: true,
        }))
    })

    return {
        entrys,
        htmlPlugins,
    }
}

const { entrys, htmlPlugins } = getEntryAndHtml();

module.exports = merge(baseConfig, {
    entry: entrys,
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: ''
    },
    mode: 'production',
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
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'images',
                            limit: 8192
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        ...htmlPlugins,
    ],
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        },
        splitChunks: {
            cacheGroups: {
                vendors: {
                    name: 'vendors',
                    chunks: 'all',
                    test: /[\\/]node_modules[\\/]/,
                    priority: 80,
                },
                reacts: {
                    test: /(react|react-dom)/,
                    name: 'reacts',
                    chunks: 'all',
                    priority: 100,
                },
                default: {
                    name: 'default',
                    test: /\.js/,
                    chunks: 'all',
                    minSize: 1,
                    minChunks: 2,
                    priority: 60,
                }
            }
        }
    },
})