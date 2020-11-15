module.exports = {
    devServer: {
        proxy: {
            '/': {
                target: 'http://localhost:4000',
                changeOrigin: true
            }
        }
    }
}