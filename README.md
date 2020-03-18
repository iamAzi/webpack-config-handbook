## Get start

### 最基础的版本

> webpack.config.js

```javascript
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'boundle.js',
        path: path.join(__dirname, 'dist')
    },
    mode: 'development',
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
        new HtmlWebpackPlugin({
            filename: 'test.html',
            template: './src/static/index.html'
        }),
    ],
}
```

> .babelrc

```javascript
{
    "presets": ["@babel/env", "@babel/preset-react"]
}
```

> package.json

```json
...
"scripts": {
    "build": "webpack --config ./webpack.config.js"
},
...
```

以上的配置就能够完成一个基础的打包工作了。

- 对ES6及以上高级语法的转义
- 对Scss的打包
- 对图片资源的打包
- 代码注入HTML模板



### 本地开发服务

这里采用node的方式起本地服务，而非webpack-dev-server方式

##### 脚本

> server.js

```js
const express = require('express');
const portfinder = require('portfinder');
const open = require('open');
const ip = require('ip');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const app = express();
const config = require('../webpack.config');
const compiler = webpack(config);

const devMiddleware = webpackDevMiddleware(compiler, {
    quiet: true,
})

app.use(devMiddleware);

portfinder.basePort = 3000

portfinder.getPortPromise().then((port) => {
    app.listen(port, () => {
        const url = `http://${ip.address()}:${port}`
        open(url)
        console.log(`Webpack Server: ${url}`)
    })
})

```

> package.json

```json
 "scripts": {
     ...
    "dev": "node ./server/server.js",
     ...
 }
```

这样就可以做到：

- 将webpack的打包内容输出到内存而不是output设置的目录
- 对打包结果进行伺服

##### webpack-dev-middleware

[git地址](<https://github.com/webpack/webpack-dev-middleware>)

这个中间件用来实现将webpack构建结果输出到内存。

需要注意的是它的几个配置项：

- index: Web服务器的索引，默认为"index.html"。
  如果你打包出来的html有专门的命名（如：homepage.html）就需要在这里配置，否则服务起来的时候会404，不会索引到对应文件。
- publicPath: 中间件构建资源的公共路径。默认为与webpack.config.output中的配置相同。

### HMR

Hot Module Replacement模块热替换

> webpack.config.js

```js
plugins: [
    ...
     new webpack.HotModuleReplacementPlugin(),
]
```

这里需要注意，除了添加这个插件以外，还需要对entry进行改造，向每一个chunk中注入HMR的代码：

```js
// 原本的
entry: './src/index.js',
// 改造后的
entry: ['webpack-hot-middleware/client?noInfo=true&reload=true', './src/index.js'],
```

> server.js

然后在server脚本中向服务器添加一个webpack-hot-middleware。

```js
...
const webpackHotMiddleware = require('webpack-hot-middleware');
...
const hotMiddleware = webpackHotMiddleware(compiler);
app.use(hotMiddleware);
...
```

这样一来就完成了HMR的配置。

从配置中也可以看到，它的实现方式是向chunk注入一段监听代码，当chunk内容发生改变的时候，就通过websocket通知服务器，触发服务器刷新。





