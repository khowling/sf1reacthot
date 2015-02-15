/**
 * Created by keith on 13/02/15.
 */
var webpack = require('webpack');

module.exports = {
    /* Switch loaders to debug mode. */
    debug: true,
    /* Choose a developer tool to enhance debugging */
    devtool: 'source-map',
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        './src/bootstrap'
    ],
    output: {
        path: __dirname + '/static/output',
        filename: 'bundle.js',
        publicPath: '/output/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin()
    ],
    module: {
        loaders: [
            {test: /\.js$/,
                exclude: [/static\/js\/lib\/.*\.js$/, /src\/lib\/csp\/.*/, /node_modules\/.*/],
                loader: '6to5'},
            { test: /\.js$/, loaders: ['react-hot', 'jsx?harmony'], exclude: /node_modules/ },
        ]
    }
};
