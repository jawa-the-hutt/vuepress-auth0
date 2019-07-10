/* eslint-disable @typescript-eslint/no-unused-vars */

import URI from 'urijs';
import AuthService from './authService';
import VueRouter, { Route } from 'vue-router';
import { pluginOptions } from './types';

const isCallback = (route: Route, cbURL: string, base: string) => {
  const cbURI = URI(cbURL);
  const cbPath: string = cbURI.path();
  const routeFullPath: string = URI.joinPaths(base, route.path).toString();
  return cbPath === routeFullPath;
}

const routeGuard = (options: pluginOptions, siteData, router: VueRouter, Vue: any) => {
  const authService: AuthService = new AuthService(options, router);
  Vue.prototype.$auth = authService;

  const { base } = siteData;
  const { nav } = siteData.themeConfig;

  return async (to, from, next) => {
    const authState: boolean = await authService.isAuthenticated();
    const link: string = to.path.replace(/\.[^/.]+$/, "");
    const linkIndex: number = nav.findIndex((x) => x.link === link);

    let routeNeedsAuth: boolean = false;
    let userHasMatchingRoles: boolean = true;
    let profileRoles: string[] = [];
    const profile: any = await authService.profile;

    if (profile && profile[options.namespace + 'roles']) {
      profileRoles = profile[options.namespace + 'roles']
    }

    // Determine if the route needs to be protected with authentication
    if (linkIndex > -1) {
      const navConfig: any = nav[linkIndex];
      if ((navConfig.meta && navConfig.meta.auth) || options.allRoutes) {
        routeNeedsAuth = true;
        // Determine if user uas matching roles for the route. If not, they will not be
        // allowed to navigate to the route
        if(!options.allRoutes && navConfig.meta.roles && navConfig.meta.roles.length > 0 && profileRoles.length > 0) {
          const matchingRoles: string[] = navConfig.meta.roles.filter((x) => profileRoles.includes(x));
          userHasMatchingRoles = matchingRoles.length > 0 ? true : false;
        }

        if(options.allRoutes && options.roles && options.roles.length > 0 && profileRoles.length > 0) {
          const matchingRoles: string[] = options.roles.filter((x) => profileRoles.includes(x));
          userHasMatchingRoles = matchingRoles.length > 0 ? true : false;
        }

      }
    }

    if (isCallback(to, options.redirectUri, base) && !authState) {
      next();
    } else
    if (!authState) {         // we are not authenticated
      if (routeNeedsAuth) {   // the route requires authentication
        authService.login({ target: to.path });
      } else {                // the route DOES NOT require authentication
        next();
      }
    } else {                  // we are authenticated
      // Does the user have matching roles. Default is true which means that without any roles
      // configured, this should pass the user into the route without issues. However, if the route
      // is configured with the meta.roles tag and DOES NOT have matching roles, then it will
      // not pass the user into the route.
      if(userHasMatchingRoles) {
        next();
      } else {
        if (options.unauthorizedRoute) {
          router.push(options.unauthorizedRoute);
        } else {
          router.push('/404');
        }
      }
    }
  }
};

export default routeGuard;

