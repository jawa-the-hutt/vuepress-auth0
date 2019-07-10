var OPTIONS = require('@dynamic/vuepress-auth0').OPTIONS;
import routeGuard from './routeGuard';
var enhancer = function (_a) {
    var Vue = _a.Vue, options = _a.options, router = _a.router, siteData = _a.siteData, isServer = _a.isServer;
    if (isServer)
        return;
    var beforeRouteHandler = routeGuard(OPTIONS, siteData, router, Vue);
    router.beforeEach(beforeRouteHandler);
};
export default enhancer;
