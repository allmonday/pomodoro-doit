var path = require("path");
var AssetsPlugin = require('assets-webpack-plugin')
var assetsPluginInstance = new AssetsPlugin({

})

var config = {
    entry: { 
        /* other projs */
        // pomodoro: "./static/pomodoro/main.js",
        // rxdemo: "./static/rx-demo.js",
        // contact: "./static/component.js",
        // dnd: "./static/dnd.js",
        'pomodoro': "./static/pomodoro"
    },
    output:{
        filename: "./static/bundle/[name].[hash].js"
    },
    external: {
        "moment": "moment",
        "lodash": {
            commonjs: "lodash",
            amd: "lodash",
            root: "_"
        }
    },
    resolve: {
        root: [
            path.resolve("./")
        ]
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015']
                }
            },
            {test: /\.scss$/, loaders: ["style", "css", "sass"]}
        ]
    },
    plugins: [
        assetsPluginInstance
    ]
}

module.exports = config;