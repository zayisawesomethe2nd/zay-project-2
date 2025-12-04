const path = require('path');

module.exports = {
    entry: {
        app: './client/viewer.jsx',
        login: './client/login.jsx',
        buildMaker: './client/buildMaker.jsx',
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    mode: 'production',
    watchOptions: {
        aggregateTimeout: 200,
    },
    output: {
        path: path.resolve(__dirname, 'hosted'),
        filename: '[name]Bundle.js',
    },
};