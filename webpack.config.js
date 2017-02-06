var path = require("path");
var AssetsPlugin = require('assets-webpack-plugin')
var assetsPluginInstance = new AssetsPlugin({})

var config = {
    entry: { 
        /* other projs */
        // pomodoro: "./static/pomodoro/main.js",
        // rxdemo: "./static/rx-demo.js",
        // contact: "./static/component.js",
        // dnd: "./static/dnd.js",
        'pomodoro': "./static/pomodoro",
        'profile': "./static/profile",
        'diary': "./static/diary"
    },
    output:{
        filename: process.env.ENV === 'prod' ? "./static/bundle/[name].[hash].js": "./static/bundle/[name].js"
    },
    external: {
        "moment": "moment",
        "toastr": {
            commonjs: "toastr",
            amd: "toastr",
            root: "toastr",
        },
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
            {
                test: /\.scss$/, 
                loaders: [
                    "style-loader", 
                    "css-loader?importLoaders=1",
                    "postcss-loader",
                    "sass"
                ]
            }
        ]
    },
    postcss: function () {
        return [
            require('autoprefixer')
        ]
    },
    plugins: [
        assetsPluginInstance
    ]
}

module.exports = config;