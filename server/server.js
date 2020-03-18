const express = require('express');
const portfinder = require('portfinder');
const open = require('open');
const ip = require('ip');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const app = express();
const config = require('../webpack.config');
const compiler = webpack(config);

const devMiddleware = webpackDevMiddleware(compiler, {
    stats: 'errors-only',
    quiet: true,
})

const hotMiddleware = webpackHotMiddleware(compiler, {
    quiet: true,
    log: false,
})

app.use(devMiddleware);
app.use(hotMiddleware);

portfinder.basePort = 3000

portfinder.getPortPromise().then((port) => {
    app.listen(port, () => {
        const url = `http://${ip.address()}:${port}`
        // open(url)
        console.log(`Webpack Server: ${url}`)
    })
})
