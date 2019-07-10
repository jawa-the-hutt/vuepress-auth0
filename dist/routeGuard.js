var _this = this;
import * as tslib_1 from "tslib";
import URI from 'urijs';
import AuthService from './authService';
var isCallback = function (route, cbURL, base) {
    var cbURI = URI(cbURL);
    var cbPath = cbURI.path();
    var routeFullPath = URI.joinPaths(base, route.path).toString();
    return cbPath === routeFullPath;
};
var routeGuard = function (options, siteData, router, Vue) {
    var authService = new AuthService(options, router);
    Vue.prototype.$auth = authService;
    var base = siteData.base;
    var nav = siteData.themeConfig.nav;
    return function (to, from, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var authState, link, linkIndex, routeNeedsAuth, userHasMatchingRoles, profileRoles, profile, navConfig, matchingRoles, matchingRoles;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, authService.isAuthenticated()];
                case 1:
                    authState = _a.sent();
                    link = to.path.replace(/\.[^/.]+$/, "");
                    linkIndex = nav.findIndex(function (x) { return x.link === link; });
                    routeNeedsAuth = false;
                    userHasMatchingRoles = true;
                    profileRoles = [];
                    return [4, authService.profile];
                case 2:
                    profile = _a.sent();
                    if (profile && profile[options.namespace + 'roles']) {
                        profileRoles = profile[options.namespace + 'roles'];
                    }
                    if (linkIndex > -1) {
                        navConfig = nav[linkIndex];
                        if ((navConfig.meta && navConfig.meta.auth) || options.allRoutes) {
                            routeNeedsAuth = true;
                            if (!options.allRoutes && navConfig.meta.roles && navConfig.meta.roles.length > 0 && profileRoles.length > 0) {
                                matchingRoles = navConfig.meta.roles.filter(function (x) { return profileRoles.includes(x); });
                                userHasMatchingRoles = matchingRoles.length > 0 ? true : false;
                            }
                            if (options.allRoutes && options.roles && options.roles.length > 0 && profileRoles.length > 0) {
                                matchingRoles = options.roles.filter(function (x) { return profileRoles.includes(x); });
                                userHasMatchingRoles = matchingRoles.length > 0 ? true : false;
                            }
                        }
                    }
                    if (isCallback(to, options.redirectUri, base) && !authState) {
                        next();
                    }
                    else if (!authState) {
                        if (routeNeedsAuth) {
                            authService.login({ target: to.path });
                        }
                        else {
                            next();
                        }
                    }
                    else {
                        if (userHasMatchingRoles) {
                            next();
                        }
                        else {
                            if (options.unauthorizedRoute) {
                                router.push(options.unauthorizedRoute);
                            }
                            else {
                                router.push('/404');
                            }
                        }
                    }
                    return [2];
            }
        });
    }); };
};
export default routeGuard;
