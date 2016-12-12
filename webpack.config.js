var config = {
    entry: { 
        pomodoro: "./static/pomodoro/main.js",
        rxdemo: "./static/rx-demo.js",
    },
    output:{
        filename: "./static/bundle/[name].js"
    },
    external: {
        "mithril": "m"
    },
    module: {
        loaders: [
            {test: /\.scss$/, loaders: ["style", "css", "sass"]}
        ]
    }
}

module.exports = config;