// vue.config.js
module.exports = {
    devServer: {
      proxy: 'http://localhost:8080',
      watchOptions: {
        ignored: /\.#|node_modules|~$/,
      },
    },
    publicPath: process.env.NODE_ENV === 'production'
        ? '/swiss-system/'
        : '/'
}
