// vue.config.js
module.exports = {
    devServer: {
	proxy: 'http://localhost:8080'
    },
    publicPath: process.env.NODE_ENV === 'production'
	? '/swiss-format/'
	: '/'
}
