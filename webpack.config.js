var path = require("path");

var config = {
    entry: { 
        // pomodoro: "./static/pomodoro/main.js",
        // rxdemo: "./static/rx-demo.js",
        // contact: "./static/component.js",
        // dnd: "./static/dnd.js",
        'mithril-dnd': "./static/mithril-dnd"
    },
    output:{
        filename: "./static/bundle/[name].js"
    },
    external: {
        "mithril": "m"
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
    }
}

module.exports = config;