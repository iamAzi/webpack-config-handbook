# Webpack Handbook

## Base Directory

### 基础内容

#### entry

entry是webpack打包的入口。这个入口可以是单个文件，也可以是多个文件的组合。

它的值可以是以下内容：

* 单独的文件路径（单文件的chunk）
* 由多个文件路径组成的Array（多文件的chunk）
* 多键值对的对象，其中对象的key为chunk名，对象的值可以是以上两种之一

每个chunk会被webpack打包成单独的文件输出出来。

典型配置：

``` js
// 设置了三个chunk，分别是app、search、vendor
entry: {
    app: './src/app.js',
    search: './src/search.js',
    vendor: ['./src/utils/time', './src/utils/url']
},
```

#### output

output定义了webpack的文件输出结果。

它的最常用特性有两个：

* `path` 定义了输出的路径
* `filename` 定义了输出的文件名

其中，path我们一般会指定到dist目录；filename会根据需要去单独定义。

filename里面经常会用到 `[name]` 占位符，该占位符在输出的时候会被替换为相应的chunk名。

典型配置：（未加hash）

``` js
output: {
    filename: '[name].js',
    path: __dirname + '/dist'
}
```

#### loaders

loader是webpack的核心之一。它主要的作用是：针对某一类型的文件，将它们处理成webpack能够识别的模块。

说白了，loader就是对某一种文件搞点想搞的事情。

loader的理念是，一个loader只做一件事情，也就是单一功能原则。

webpack本身只提供了对js和json的解析功能，也就是它不认识js中import的如CSS、React JSX、图片资源等模块（webpack中一切皆模块），这时候就需要借助各种各样的loader来解析，把它们转化成webpack认识的模块。

常用的loader有：

* `CSS` 
  + style-loader
  + css-loader
  + sass-loader
  + less-loader
  + postcss-loader
  + MiniCSSExtractPlugin.loader

* `Javascript` 
  + babel-loader

* `图片、字体资源` 
  + url-loader
  + file-loader

这里还需要注意的是，loader一般都还有自己的配置项。

我们可以选择将配置项直接写在webpack loader中：

``` css
{

    loader: 'css-loader',
    options: {
        modules: true
    }
}
```

也可以选择将配置项作为单独的文件存放：

``` js
// .babelrc
{
    "presets": ["@babel/env", "@babel/preset-react"]
}
```

当然，这里就涉及到了这些loader背后强大的功能了。像babel，postcss这些一般都选择将配置文件单独存放。

另外，除了上面的方法，我们还可以将loader内联到js代码的import方法中，但这种方式并不推荐，所以不做详细介绍，具体可看[官方文档](https://www.webpackjs.com/concepts/loaders/#%E5%86%85%E8%81%94)

**loaders的执行顺序是从右到左的，这是为什么呢？**

> 可以将loader理解为一个函数，输入的是上一个loader传过来的字符串，经过本loader处理以后，再输出到下一个loader去。
> webpack loader函数执行时采用的是 `compose` 的方式，这种方式决定了在后面定义的函数会先执行，返回结果给前一级函数（与 `pipe` 方式正好相反）

典型配置：

``` js
    module: {
        rules: [{
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
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'images',
                        limit: 8192
                    }
                }]
            }
        ]
    },
```

#### plugins

plugins是webpack的又一个核心内容。

与loader不同的是，它处理的目标是整个打包过程（compile和compilation）

除了从entry找到入口文件，通过loader将各种文件都解析成webpack能够识别的模块，将最终的结果输出（emit）到制定目录外，文件打包还有很多很多其他的工作需要做，比如：

* 代码压缩
* 打包加速
* 代码压缩
* 打包速度和包体大小分析
* 将资源嵌入HTML页面（webpack本身只是在处理js）
* 每次打包前清空dist目录
* 抽离CSS文件
* log瘦身

要想实现这些功能，就需要从每次webpack的构建层面去入手了。

如果去看Webpack的源码就会发现，webpack本身提供了非常多的钩子（基于tapable实现），并且会将每次构建作为参数传递给plugin，这样plugin就可以拿到构建过程中的各种hooks，从而在不同阶段做各种各样的事情。

常用的plugins有：

* `HotModuleReplacementPlugin` 本地调试时实现热替换
* `HtmlWebpackPlugin` 将资源插入到HTML模板中
* `MiniCSSExtractPlugin` 将打包出来的CSS资源抽取成独立的文件
* `CleanWebpackPlugin` 清理dist目录
* `FriendlyErrorsPlugin` log瘦身
* `BundleAnalyzerPlugin` 分析包体大小

还有一些其他的plugin这里暂时不做详细介绍。

典型配置：

``` js
plugins: [
    new CleanWebpackPlugin(),
    new MiniCSSExtractPlugin({
        filename: '[name].css'
    }),
],
```

#### mode

mode是webpack4里面新增的内容。是webpack为“零配置”而努力的结果。

通过设置mode，webpack能够自动的帮我们做一些事情。

mode有三种可选项：

* none
* development
* production

具体的直接搬来官网表述：

|选项 |描述 |
|---|---|
| none | 啥也不做 |
| development  | 会将 process.env. NODE_ENV 的值设为 development。启用 NamedChunksPlugin 和 NamedModulesPlugin。  |
| production  | 会将 process.env. NODE_ENV 的值设为 production。启用 FlagDependencyUsagePlugin, FlagIncludedChunksPlugin, ModuleConcatenationPlugin, NoEmitOnErrorsPlugin, OccurrenceOrderPlugin, SideEffectsFlagPlugin 和 UglifyJsPlugin.|

#### 解析ES6和JSX

#### 解析CSS、LESS、SASS

#### 解析图片和字体

#### 文件监听

#### 热更新

#### 文件hash策略

#### 代码压缩

### 进阶内容

#### 清理构建目录

#### PostCss

#### px2rem

#### 静态资源内联

#### sourceMap

#### 提取页面公共资源

#### Tree Shaking

#### Scope Hoisting

#### 代码分割和动态加载

#### ESlint

#### 打包组件和基础库

#### 优化日志

### 优化配置

#### stats

#### speed-measure-webpack-plugin

#### webpack-bundle-analyzer

#### 多进程多实例构建

#### 多进程压缩代码

#### 预编译资源模块

#### 打包缓存

#### 缩小构建目标

#### Tree Shaking

#### 图片压缩

#### 动态Polyfill

## Get start

### 最基础的版本

> webpack.config.js

``` javascript
const path = require('path');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'boundle.js',
        path: path.join(__dirname, 'dist')
    },
    mode: 'development',
    module: {
        rules: [{
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
                use: [{
                    loader: 'url-loader',
                    options: {
                        outputPath: 'images',
                        name: '[name].[ext]',
                        limit: 8192
                    }
                }]
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

``` javascript
{
    "presets": ["@babel/env", "@babel/preset-react"]
}
```

> package.json

``` json
...
"scripts": {
    "build": "webpack --config ./webpack.config.js"
},
...
```

以上的配置就能够完成一个基础的打包工作了。

* 对ES6及以上高级语法的转义
* 对Scss的打包
* 对图片资源的打包
* 代码注入HTML模板

### 本地开发服务

这里采用node的方式起本地服务，而非webpack-dev-server方式

##### 脚本

> server.js

``` js
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
        console.log( `Webpack Server: ${url}` )
    })
})
```

> package.json

``` json
 "scripts": {
     ...
    "dev": "node ./server/server.js",
     ...
 }
```

这样就可以做到：

* 将webpack的打包内容输出到内存而不是output设置的目录
* 对打包结果进行伺服

##### webpack-dev-middleware

[git地址](<https://github.com/webpack/webpack-dev-middleware>)

这个中间件用来实现将webpack构建结果输出到内存。

需要注意的是它的几个配置项：

* index: Web服务器的索引，默认为"index.html"。

  如果你打包出来的html有专门的命名（如：homepage.html）就需要在这里配置，否则服务起来的时候会404，不会索引到对应文件。

* publicPath: 中间件构建资源的公共路径。默认为与webpack.config.output中的配置相同。

### HMR

Hot Module Replacement模块热替换

> webpack.config.js

``` js
plugins: [
    ...
    new webpack.HotModuleReplacementPlugin(),
]
```

这里需要注意，除了添加这个插件以外，还需要对entry进行改造，向每一个chunk中注入HMR的代码：

``` js
// 原本的
entry: './src/index.js',
    // 改造后的
    entry: ['webpack-hot-middleware/client?noInfo=true&reload=true', './src/index.js'],
```

> server.js

然后在server脚本中向服务器添加一个webpack-hot-middleware。

``` js
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

使用它，我们就需要在处理css的时候加上一个 `postcss-loader` 

postcss本身功能很强大，可以对CSS文件做一些预处理工作，这里使用单独的配置文件来配置它。

> postcss.config.js

``` js
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

``` js
module.exports = {
    ...
    module: {
        rules: [
            ...{
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

* 通过 `FriendlyErrorsPlugin` 这个插件，可以打印出诸如构建时间，构建结果之类的重要信息。

* 通过对 `stats` 的配置，可以去掉webpack原生的一些打印内容。

> webpack.config.js

``` js
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

``` js
const devMiddleware = webpackDevMiddleware(compiler, {
    stats: 'errors-only',
    quiet: true,
})

const hotMiddleware = webpackHotMiddleware(compiler, {
    quiet: true,
    log: false,
})
```

注意， `devMiddleware` 的 `stats` 参数和 `webpack.config.js` 中的stats是相同的逻辑。

### 打包分析

借助 `BundleAnalyzerPlugin` 可以看到对打包结果的分析。

这一工具的可视化做得很好，有利于我们在后面做代码分离时查看配置效果。

> webpack.config.js

``` js
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

``` js
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

* split前

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

* split后

``` js
                                      Asset Size Chunks Chunk Names
                                      images / icon.png 60.5 KiB[emitted]
                                      index.html 447 bytes[emitted]
                                      index.js 197 KiB index[emitted] index
                                      pageA.html 447 bytes[emitted]
                                      pageA.js 149 KiB pageA[emitted] pageA
                                      pageB.html 447 bytes[emitted]
                                      pageB.js 134 KiB pageB[emitted] pageB
                                      vendors.js 780 KiB vendors[emitted] vendors
```

#### SplitChunks

代码分离的关键点就在于splitChunks的配置（它实际上是在配置 `SplitChunksPlugin` 插件）。

它的作用总结来说就是：将待打包的chunks中公共的部分抽离出来，成为单独的共用chunk。

前一步我们做到了抽离react和react-dom，实际开发中我们还有其他可抽离的部分，如：

* node_modules
* 公共方法

通过SplitChunks就可以将它们都分离出来。

``` js
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

如果在上一步安装了BundleAnalyzer插件，能够看的很明显。

#### Runtime和Manifest

在使用 webpack 构建的典型应用程序或站点中，有三种主要的代码类型：

1. 你或你的团队编写的源码。
2. 你的源码会依赖的任何第三方的 library 或 "vendor" 代码。
3. webpack 的 runtime 和 *manifest*，管理所有模块的交互。

runtime 和 manifest 数据，主要是指：在浏览器运行时，webpack 用来连接模块化的应用程序的所有代码。

runtime 包含了在模块交互时，连接模块所需的加载和解析逻辑。包括浏览器中的已加载模块的连接，以及懒加载模块的执行逻辑。

通过使用 manifest 中的数据，runtime 将能够查询模块标识符，检索出背后对应的模块。

这里通过runtimeChunks配置我们可以将这部分也抽离出来：

> webpack.config.js

``` js
module.exports = {
    //...
    optimization: {
        runtimeChunk: {
            name: 'manifest'
        }
    }
}
```

这个时候再看打包结果

``` 
         Asset       Size    Chunks             Chunk Names
     default.js   9.82 KiB   default  [emitted]  default
images/icon.png   60.5 KiB            [emitted]  
      index.css  126 bytes     index  [emitted]  index
     index.html  738 bytes            [emitted]  
       index.js   25.1 KiB     index  [emitted]  index
    manifest.js   31.1 KiB  manifest  [emitted]  manifest
      pageA.css   96 bytes     pageA  [emitted]  pageA
     pageA.html  738 bytes            [emitted]  
       pageA.js   20.5 KiB     pageA  [emitted]  pageA
      pageB.css   30 bytes     pageB  [emitted]  pageB
     pageB.html  738 bytes            [emitted]  
       pageB.js     20 KiB     pageB  [emitted]  pageB
      reacts.js    780 KiB    reacts  [emitted]  reacts
     vendors.js    688 KiB   vendors  [emitted]  vendors
```

可以发现pageA，pageB，index都进一步变小了，同时一个manifest包被抽了出来。

### 动态化的入口

如果不是SPA应用，我们的应用会有很多个同级别的页面入口，之前的配置中每更新一个入口都要去entry和HtmlWebpackPlugin中添加。现在改成自动匹配并添加的方式：

``` js
const getEntryAndHtml = () => {
    const filePath = glob.sync(path.join(__dirname, '../src/pages/**/*.js'))

    let entrys = {};
    let htmlPlugins = [];

    filePath.forEach(item => {
        const match = item.match(/pages\/(.+)\/index\.js$/);
        const name = match && match[1];

        entrys[name] = ['webpack-hot-middleware/client?noInfo=true&reload=true', item];
        htmlPlugins.push(
            new HtmlWebpackPlugin({
                filename: `${name}.html` ,
                template: path.join(__dirname, '../src/static/index.html'),
                chunks: [name, 'vendors', 'reacts', 'default', 'manifest'],
                inject: true,
            })
        )
    })

    return {
        entrys,
        htmlPlugins,
    }
}

const {
    entrys,
    htmlPlugins
} = getEntryAndHtml();

module.exports = {
    entry: entrys,
    plugins: [
        ...htmlPlugins,
    ]
}
```

这样就会自动匹配src/pages目录下面不同页面的index.js文件了

其中需要注意：

* HtmlWebpackPlugin中的chunks是一个数组对象，它的配置要根据SplitChunks来设置。这里的设置决定了Html中会有哪些Chunk被引入进来。漏掉一个或者多了一个是必然会影响页面实际输出的。

### 分离config

实际开发中我们会遇到不同的开发环境，不同的环境对webpack打包的需求也不一样，所以这里将之前的 `webpack.config.js` 拆分成三个文件：

> webpack.config.base.js

``` js
const path = require('path');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
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
```

> webpack.config.dev.js

``` js
const path = require('path');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const webpack = require('webpack');
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
        htmlPlugins.push(
            new HtmlWebpackPlugin({
                filename: `${name}.html` ,
                template: path.join(__dirname, '../src/static/index.html'),
                chunks: [name, 'vendors', 'reacts', 'default', 'manifest'],
                inject: true,
            })
        )
    })

    return {
        entrys,
        htmlPlugins,
    }
}

const {
    entrys,
    htmlPlugins
} = getEntryAndHtml();

module.exports = merge(baseConfig, {
    entry: entrys,
    mode: 'development',
    devtool: 'cheap-source-map',
    module: {
        rules: [{
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
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'images',
                        limit: 8192
                    }
                }]
            }
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new BundleAnalyzerPlugin(),
        new FriendlyErrorsPlugin(),
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
```

> webpack.config.prod.js

``` js
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
            filename: `${name}.html` ,
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

const {
    entrys,
    htmlPlugins
} = getEntryAndHtml();

module.exports = merge(baseConfig, {
    entry: entrys,
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: ''
    },
    mode: 'production',
    module: {
        rules: [{
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
                use: [{
                    loader: 'url-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'images',
                        limit: 8192
                    }
                }]
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
```

这里实际上就是将之前的config拆分到了三个config中。

这里还用到了webpack-merge，来完成webpack-config的合并操作。

然后根据dev和prod环境需求的不同做了一些区别化的配置。

修改了config以后，server和package.json中的路径也需要响应修改，这里不做赘述。

这一步只是先将配置项分开，方便接下来进行优化之类的配置。

