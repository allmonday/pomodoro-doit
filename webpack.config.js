var config = {
    entry: { 
        pomodoro: "./static/pomodoro/main.js",
        rxdemo: "./static/rx-demo.js",
        contact: "./static/component.js",
        dnd: "./static/dnd.js"
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