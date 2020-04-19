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

>  典型配置：

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

> 典型配置：（未加hash）

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

> 典型配置：

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

> 典型配置：

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

webpack本身没法识别ES6和React JSX语法，这就需要我们用专门的loader来处理源文件。

Babel就是用来做这件事情的。

官网介绍：

> Babel 是一个工具链，主要用于将 ECMAScript 2015+ 版本的代码转换为向后兼容的 JavaScript 语法，以便能够运行在当前和旧版本的浏览器或其他环境中。下面列出的是 Babel 能为你做的事情：

> - 语法转换
> - 通过 Polyfill 方式在目标环境中添加缺失的特性 (通过 @babel/polyfill 模块)
> - 源码转换 (codemods)

说白了，Babel本身就是一个提供Js语法转换的工具，它又针对webpack提供了一个专门的`babel-loader`。

前面提到过，loader的配置项可以写在webpack配置文件中，也可以作为配置文件独立处理。对于babel，通常都是独立处理的。

babel配置文件命名为`.babelrc`。

最常用的配置项是预设（presets），即官方提供的语法转换方案。不同的预设可以识别不同的Js语法。

官方针对常用环境编写了一些 preset：

- @babel/preset-env
- @babel/preset-flow
- @babel/preset-react
- @babel/preset-typescript

具体关于babel的内容可以去参考官方文档，此处不再详述。

通过对babel预设的配置，就可以实现webpack对ES6+及React JSX的打包。

> 典型配置：

```js
// .webpack.config.js
{
    test: /\.jsx?$/,
    use: [
        'babel-loader'
    ]
},

// .babelrc
{
    "presets": ["@babel/env", "@babel/preset-react"]
}
```

#### 解析CSS、LESS、SASS

解析CSS、LESS和SASS是`webpack `最常用的基本的功能。

也是最典型的用法。

将不同类型的CSS通过不同的loader进行处理。

- style-loader 将模块化的CSS文件插入到HTML中

- css-loader 将CSS文件转化成webpack能够识别的js模块
- sass-loader 将SASS转化为CSS
- less-loader 将LESS转化为CSS
- postcss-loader 对CSS文件进行预处理（做autoprefixer等）
- MiniCSSExtractPlugin.loader 将CSS文件输出为单独的文件，与`style-loader`互斥 



具体的来看

##### css-loader

`css-loader` 用来解释(interpret) `@import` 和 `url()` ，这两个功能也都能够通过配置关闭。

如果需要使用CSS-Modules，也是在这里配置。

##### sass-loader

加载一个SASS/SCSS文件，并将它们编译成CSS。然后再用css-lodaer或者raw-loader把它转成js模块。

它依赖于`node-sass`包

##### style-loader

简单来说，`style-loader`是将`css-loader`打包好的css代码以`<style>`标签的形式插入到html文件中。

##### postcss-loader

对css文件进行预处理，我们可以将配置直接放在`webpack.config.js`中，也可以独立出来。

```js
// 直接写在webpack配置中
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: [
          require('autoprefixer')
        ]
      }
    }
  ]
}
```

如果独立出来，则放在单独的postcss配置文件中就好了。（配置postcss的时候通常还要配置browserslistrc）

```js
// postcss.config.js
module.exports = {
  plugins: [
       require('autoprefixer')
    ]
}
```

>  典型配置：

```js
{
    test: /\.scss$/,
    use: [
        // 'style-loader',
        MiniCSSExtractPlugin.loader,
        'css-loader',
        'sass-loader',
        'postcss-loader'
    ]
}
```

#### 解析图片和字体

解析图片和字体最常用的是两个：

- file-loader
- url-loader

##### file-loader

解析资源，输出到设置的输出目录，并返回public URL

它的配置项包括：

- name: 为输出文件定义文件名
- publicPath: 定义public path目录，默认为webpack的设置
- outputPath: 自定义输出目录

```js
{
  loader: 'file-loader',
  options: {
    name: '[path][name].[ext]',
    publicPath: 'assets/',
    outputPath: 'images/'
  }
}
```

##### url-loader

`url-loader` 功能类似于 `file-loader`，但是在文件大小（单位 byte）低于指定的限制时，可以返回一个 DataURL，将资源内联到js中，减少页面请求。

它的配置项包括：

- limit：少于多少就做DataURL转换的配置
- mimetype：对特定的媒体类型进行转换

```js
{
  loader: 'url-loader',
  options: {
  	limit: 8192,
    mimetype: 'image/png'
  }
}
```

#### 文件监听

源码发生变化时，自动构建新的输出文件。

- 启动webpack时，npm指令中带上`--watch`
- 在webpack.config.js中设置watch: true

缺点：需要手动刷新浏览器



文件监听是通过轮询判断文件的最后编辑时间来实现的。

webpack监听到一个文件变更以后，不会立刻触发更新，而是先缓存起来，等到一个aggregateTimeout到的时候再一起更新。

配置项：

```js
watchOptions: {
    ignored: /node_modules/,    // 不需要监听的目录
    aggregateTimeout: 300,    // 监听到变化后到更新的间隔时间
    poll: 1000,    // 轮询间隔时间
}
```

#### 热更新

热更新可以解决`watch`模式修改文件后还需要手动刷新浏览器的问题。

实现热更新的基础方式是通过`webpack-dev-server` +` HotModuleReplacementPlugin`。

webpack-dev-server会将打包后的文件保存在内存中，提高构建和访问的速度，然后在本地起一个服务。

热更新的初级配置如下：

```js
...
plugins: [
    new webpack.HotModuleReplacementPlugin()
],
devServer: {
    contentBase: './dist',
	hot: true
}
...
```

在实际开发中，devServer提供的内容不一定能满足我们的服务需求，就需要我们在自己的本地Server中自己去做WDS的功能。

这就需要用到`webpack-dev-middleware`。

- `webpack-dev-middleware` 将文件输出到内存；watch文件的变化
- `webpack-hot-middleware` 将它们推送给浏览器 [WHM详细介绍](<https://www.jianshu.com/p/bba6bc0a0739>)

```js
// 本地Server简单配置
const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const app = express();
const config = require('../webpack.config');

const compiler = webpack(config);

const devMiddleware = webpackDevMiddleware(compiler, {
    quiet: true,
})

const hotMiddleware = webpackHotMiddleware(compiler);

app.use(devMiddleware);
app.use(hotMiddleware);

app.listen(3000, () => {
    const url = `http://${ip.address()}:${port}` 
    console.log( `Webpack Server: ${url}` )
})
```

> 具体的配置在后续专门的HMR章节中，这里不做赘述

热更新的流程和原理：

1. 启动时，webpack将文件打包成bundle，输出到Server中
2. 文件更新时，webpack将文件更新通知到HMR Server
3. HMR Server会将文件推送到浏览器端的HMR Runtime中，更新浏览器端的代码

#### 文件hash策略

hash指纹存在主要是为了做文件版本管理和缓存管理。

- `hash` 关联整个项目的构建，只要项目中文件有修改，hash值就会变化。

- `chunkhash` 关联文件当前所属的chunk，同chunk中的文件变化时，chunkhash会变化。**通常用在js中。**
- `contenthash` 关联当前文件内容，当文件内容不变时，contenthash不变。**通常用在CSS中**，屏蔽js变化导致的hash变化。

另外，还需要注意`file-loader`中的hash。它的占位符`[hash]`特指文件内容的hash，默认是`md5`生成。

```js
...
output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name]_[chunkhash:8].js'    // js文件指纹
}
...
module: {
    rules: [
        ...
        {
            test: /\.(png|jpg|gif)$/,
            use: [
                {
                    loader: 'file-loader',
                    options: {
                        name: '[name]_[hash:8][ext]'   // 图片文件指纹
                    }
                }
            ]
        }
    ]
},
plugins: [
    new MiniCssExtractPlugin({
        filename: '[name]_[contenthash:8].css'    // CSS文件指纹
    })
]
```

#### 代码压缩

##### 压缩JavaScript

webpack4中内置了`uglifyjs-webpack-plugin` 

##### 压缩CSS

通常可以用`optimize-css-assets-webpack-plugin` + `cssnano`。

`cssnano`原本用在postcss中的一个工具，所以其实也可以直接在postcss的配置文件中设置CSS压缩：

```js
// postcss.config.js
module.exports = {
    plugins: [
        require('cssnano')({
            preset: 'default',
        }),
    ],
};
```

##### 压缩HTML

单页应用可借助`html-webpack-plugin`

> 典型配置

```js
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

optimization: {
    minimizer: [ // 用于配置 minimizers 和选项
        new UglifyJsPlugin({
            cache: true,
            parallel: true,
            sourceMap: true // set to true if you want JS source maps
        }),
        new OptimizeCSSAssetsPlugin({})
    ]
}，
plugins: [
    ...
    new HtmlWebpackPlugin({
        filename: 'index.html',// 输出文件的名称
        template: path.resolve(__dirname, 'src/index.html'),// 模板文件的路径
        title:'webpack-主页',// 配置生成页面的标题
        minify:{
            removeRedundantAttributes:true, // 删除多余的属性
            collapseWhitespace:true, // 折叠空白区域
            removeAttributeQuotes: true, // 移除属性的引号
            removeComments: true, // 移除注释
            collapseBooleanAttributes: true // 省略只有 boolean 值的属性值 例如：readonly checked
        },
        favicon:''
    })
    ...
],
```

### 进阶内容

#### 清理构建目录

使用[`CleanWebpackPlugin`](<https://github.com/johnagan/clean-webpack-plugin>)

```js
plugins: [
    new CleanWebpackPlugin(),
],
```

#### PostCSS

是一个用 JavaScript 工具和插件转换 CSS 代码的工具。

PostCSS与SASS不同，是一个预处理器，就像是CSS界的babel。

常用功能：

- `autoprefixer` 自动添加浏览器前缀
- `stylelint` CSS编程检测和约定
- 支持CSS Modules

其中最常用的就是autoprefixer。具体在webpack中的配置方式后文中有。

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

