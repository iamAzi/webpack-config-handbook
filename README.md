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
                            name: '[name].[ext]',
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

### Autoprefixer

autoprefixer是postcss的一个插件。

使用它，我们就需要在处理css的时候加上一个`postcss-loader`

postcss本身功能很强大，可以对CSS文件做一些预处理工作，这里使用单独的配置文件来配置它。

> postcss.config.js

```js
module.exports = {
    "plugins": [
      require('autoprefixer')({
        overrideBrowserslist: [
          "> 1%",
          "last 2 versions",
          "not ie <= 8"
        ]
      })
    ]
  }
  
```

然后再添加loader：

> webpack.config.js

```js
module.exports = {
    ...
    module: {
        rules: [
            ...
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
                    'postcss-loader'
                ]
            },
        ]
    }
}
```

这样，我们就可以在代码中放心的使用flex之类的属性，而浏览器前缀交给webpack就好了。

### 输出简化

当前webpack构建或者热更新过程中会在控制台打印出非常多的信息，这些信息可能并不必要。

优化主要是通过以下手段：

- 通过`FriendlyErrorsPlugin`这个插件，可以打印出诸如构建时间，构建结果之类的重要信息。

- 通过对`stats`的配置，可以去掉webpack原生的一些打印内容。

> webpack.config.js

```js
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

module.exports = {
    ...
    plugins: [
        ...
        new FriendlyErrorsPlugin(),
    ],
    stats: {
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }
}
```

此外，开发环境中的打印信息，我们需要在server.js中，通过对中间件的配置来实现简化。

> server.js

```js
const devMiddleware = webpackDevMiddleware(compiler, {
    stats: 'errors-only',
    quiet: true,
})

const hotMiddleware = webpackHotMiddleware(compiler, {
    quiet: true,
    log: false,
})
```

注意，`devMiddleware`的`stats`参数和`webpack.config.js`中的stats是相同的逻辑。

### 打包分析

借助`BundleAnalyzerPlugin`可以看到对打包结果的分析。

这一工具的可视化做得很好，有利于我们在后面做代码分离时查看配置效果。

> webpack.config.js

```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    ...
    plugins: [
    	...
    	new BundleAnalyzerPlugin(),
    ]
}
```

打包完成之后，会在8888端口起一个服务，展示构建结果中各个模块的组成和大小。

### 代码分离

#### 分离react试试

目前我们没有做代码分离，导致的结果是像react这样比较大的包会被打包到bundle.js中。可能本身文件不大，但是react却很大。

对多页面应用来说，势必会造成每个chunk都很大，大家都用了react，而大家都打包了react。此时将react分离出来，作为一个公共的部分，让每个chunk单独引用它成为了一种必要。

webpack4中代码分离的操作并不复杂：

> webpack.config.js

```js
module.exports = {
    ...
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
}
```

如上配置就可以将react和react-dom分离到单独的vendors文件中。



为了更好的查看这一效果，最好将测试代码改造一下，entry中设置多个chunks，HtmlWebpackPlugin也需要配置多份（模拟多页应用的状态）



这样打包出来可以看到非常明显的差别：

- split前

```
                                      Asset       Size  Chunks             Chunk Names
							images/icon.png   60.5 KiB          [emitted]
                                 index.html  390 bytes          [emitted]
                                   index.js    974 KiB   index  [emitted]  index
                                 pageA.html  390 bytes          [emitted]
                                   pageA.js    215 KiB   pageA  [emitted]  pageA
                                 pageB.html  390 bytes          [emitted]
                                   pageB.js    199 KiB   pageB  [emitted]  pageB
```



- split后

```js
                                      Asset       Size   Chunks             Chunk Names
							images/icon.png   60.5 KiB           [emitted]
                                 index.html  447 bytes           [emitted]
                                   index.js    197 KiB    index  [emitted]  index
                                 pageA.html  447 bytes           [emitted]
                                   pageA.js    149 KiB    pageA  [emitted]  pageA
                                 pageB.html  447 bytes           [emitted]
                                   pageB.js    134 KiB    pageB  [emitted]  pageB
                                 vendors.js    780 KiB  vendors  [emitted]  vendors
```

#### SplitChunks

代码分离的关键点就在于splitChunks的配置（它实际上是在配置`SplitChunksPlugin`插件）。

它的作用总结来说就是：将待打包的chunks中公共的部分抽离出来，成为单独的共用chunk。

前一步我们做到了抽离react和react-dom，实际开发中我们还有其他可抽离的部分，如：

- node_modules
- 公共方法

通过SplitChunks就可以将它们都分离出来。

```js
        ...
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
```

以上配置就做到了

1. 先将react和react-dom组成一个chunk（cacheGroups中的key就是chunk名），然后提取出来成reacts.js。
2. 将node_modules中其他的部分组成一个chunk，提取成vendors.js。
3. 将所有后缀名为js的文件中，至少被2个chunk引用的，最小为1B的包提取出来变成default.js。

> 这里需要注意下chunks: 'all' 的配置，如果使用默认值async可能无法达到想要的效果。



往工程中安装一个新的包，并在页面中引用它，供测试使用

```
npm i -D moment
```

以上的配置会将文件最终打包成：

```
          Asset       Size   Chunks             Chunk Names
     default.js   9.82 KiB  default  [emitted]  default
images/icon.png   60.5 KiB           [emitted]  
      index.css  126 bytes    index  [emitted]  index
     index.html  680 bytes           [emitted]  
       index.js   56.2 KiB    index  [emitted]  index
      pageA.css   96 bytes    pageA  [emitted]  pageA
     pageA.html  680 bytes           [emitted]  
       pageA.js   51.6 KiB    pageA  [emitted]  pageA
      pageB.css   30 bytes    pageB  [emitted]  pageB
     pageB.html  680 bytes           [emitted]  
       pageB.js   51.1 KiB    pageB  [emitted]  pageB
      reacts.js    780 KiB   reacts  [emitted]  reacts
     vendors.js    688 KiB  vendors  [emitted]  vendors
```

可以看到跟前面只打包react/react-dom相比，页面的js体积更小了

