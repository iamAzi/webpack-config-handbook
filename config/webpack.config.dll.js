const path = require('path')
const webpack = require('webpack');
const ManifestPlugin = require('webpack-manifest-plugin');


module.exports = {
    entry: {
        // 定义程序中打包公共文件的入口文件vendor.js
        vendor: ['react', 'react-dom'],
    },
    mode: 'none',
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: `[name].js`,
        library: '[name]'
    },
    plugins: [
        new ManifestPlugin({
            fileName: 'manifest.json'
        }),
        new webpack.DllPlugin({
            // manifest.json文件的输出位置
            path: path.resolve(__dirname, '../dist/[name].manifest.json'),

            // 定义打包的公共vendor文件对外暴露的函数名
            name: '[name]_[hash]'
        })
    ]
}