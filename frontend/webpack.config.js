const path = require('path')

const webpack = require('webpack');
const prod = process.argv.indexOf('-p') !== -1;

module.exports = {
    // ... other config options
    devServer: {
        static: {
            directory: path.join(__dirname, './dist')
        },
        compress: true,
        historyApiFallback: true,
        open: true,
        hot: true,
        port: 9000,
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env.URL_BACKEND': prod ? `"http://64.226.123.247:80"` : '"http://127.0.0.1:8000"'
        })
    ]
};

//module.exports = {
//    plugins: [
//        new webpack.DefinePlugin({
//            process: {
//                env: {
//                    URL_BACKEND: prod ? `"http://64.226.123.247:80"` : '"http://172.0.0.1:8000"'
//                }
//            }
//        }),
//    ]
//};
//
//module.exports = {
//    devServer: {
//        static: {
//            directory: path.join(__dirname, './dist')
//        },
//        compress: true,
//        historyApiFallback: true,
//        open: true,
//        hot: true,
//        port: 9000,
//    },
//};
