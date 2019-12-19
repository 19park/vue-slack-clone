module.exports = {
    transpileDependencies: ['vuetify'],
    configureWebpack: {
        entry: ["babel-polyfill", "./src/main.js"]
    },
    devServer: { port: 3000 }
};
