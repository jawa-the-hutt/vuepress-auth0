(function(f){typeof define==='function'&&define.amd?define(f):f();}(function(){'use strict';const path = require('path');
module.exports = (options, context) => ({
    enhanceAppFiles: [path.resolve(__dirname, './enhancer.js')],
    clientDynamicModules: () => ({
        name: 'vuepress-auth0',
        content: `export const OPTIONS = ${JSON.stringify(options)}`,
    }),
});}));