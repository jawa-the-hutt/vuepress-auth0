/* eslint-disable no-unused-vars */

/* eslint-disable @typescript-eslint/no-var-requires */
const { OPTIONS } = require('@dynamic/vuepress-auth0');
const routeGuard = require('./routeGuard').default;
/* eslint-enable  @typescript-eslint/no-var-requires */


const enhancer = ({
  Vue, // the version of Vue being used in the VuePress app
  options, // the vueOptions for the root Vue instance
  router, // the router instance for the app
  siteData, // site metadata
  isServer, // true if is being server rendered
}) => {
  if (isServer) return;
  console.log('siteData - ', siteData);

  const beforeRouteHandler = routeGuard(OPTIONS, siteData, router);
  router.beforeEach(beforeRouteHandler);
};

export default enhancer;
