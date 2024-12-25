const path = require('path')

module.exports = {
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
};
