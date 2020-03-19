const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, '../dist'),
        publicPath: ''
    },
    plugins: [
        new CleanWebpackPlugin(),
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