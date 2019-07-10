/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */

const path = require('path');
import { pluginOptions } from './types';

module.exports = (options: pluginOptions, context) => ({
  name: 'vuepress-auth0',
  enhanceAppFiles: [path.resolve(__dirname, './enhancer.js')],
  clientDynamicModules: () => ({
    name: 'vuepress-auth0',
    content: `export const OPTIONS = ${JSON.stringify(options)}`,
  }),
});
