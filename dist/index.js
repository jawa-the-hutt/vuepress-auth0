var path = require('path');
module.exports = function (options, context) { return ({
    enhanceAppFiles: [path.resolve(__dirname, './enhancer.js')],
    clientDynamicModules: function () { return ({
        name: 'vuepress-auth0',
        content: "export const OPTIONS = " + JSON.stringify(options),
    }); },
}); };
