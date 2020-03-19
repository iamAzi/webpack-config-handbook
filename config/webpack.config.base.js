const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
const glob = require('glob');

module.exports = {
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../dist'),
        publicPath: ''
    },
    plugins: [
        new CleanWebpackPlugin(),
        new FriendlyErrorsPlugin(),
        new MiniCSSExtractPlugin({
            filename: '[name].css'
        }),
    ],
    stats: {
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }
}