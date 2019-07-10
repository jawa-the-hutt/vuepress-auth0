/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */

const { OPTIONS } = require('@dynamic/vuepress-auth0');
import routeGuard from './routeGuard';

const enhancer = ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the vueOptions for the root Vue instance
  router, // the router instance for the app
  siteData, // site metadata
  isServer, // true if is being server rendered
}) => {
  if (isServer) return;

  const beforeRouteHandler: Function = routeGuard(OPTIONS, siteData, router, Vue);
  router.beforeEach(beforeRouteHandler);
};

export default enhancer;
