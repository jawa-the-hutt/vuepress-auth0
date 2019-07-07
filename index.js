/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = (options, context) => ({
  enhanceAppFiles: [path.resolve(__dirname, './lib/enhancer.js')],
  clientDynamicModules: () => ({
    name: 'vuepress-auth0',
    content: `export const OPTIONS = ${JSON.stringify(options)}`,
  }),
});
