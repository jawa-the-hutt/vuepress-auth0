/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */

const URI = require('urijs');
const AuthService = require('./authService').default;

const isCallback = (route, cbURL, base) => {
  const cbURI = URI(cbURL);
  const cbPath = cbURI.path();
  const routeFullPath = URI.joinPaths(base, route.path).toString();
  return cbPath === routeFullPath;
}


const routeGuard = (options, siteData, router) => {
  console.log('options - ', options)
  const authService = new AuthService(options, router);
  const { base } = siteData;
  const { nav } = siteData.themeConfig;
  console.log('nav - ', nav);

  return async (to, from, next) => {
    const authState = await authService.isAuthenticated();
    const link = to.path.replace(/\.[^/.]+$/, "");
    console.log('link - ', link);
    const linkIndex = nav.findIndex((x) => x.link === link);

    let routeNeedsAuth = false;
    let userHasMatchingRoles = true;
    let profileRoles = [];
    const profile = await authService.profile;
    // console.log('profile - ', profile);

    if (profile && profile[options.namespace + 'roles']) {
      profileRoles = profile[options.namespace + 'roles']
    }

    // Determine if the route needs to be protected with authentication
    if (linkIndex > -1) {
      const navConfig = nav[linkIndex];
      if ((navConfig.meta && navConfig.meta.auth) || options.authAll) {
        routeNeedsAuth = true;
        // Determine if user uas matching roles for the route. If not, they will not be
        // allowed to navigate to the route
        if((navConfig.meta.roles.length > 0 && profileRoles.length > 0) || (options.authAll && options.authAllRoles.length > 0 && profileRoles.length > 0)) {
          const matchingRoles = [...new Set(navConfig.meta.roles)].filter(x => new Set(profileRoles).has(x));
          userHasMatchingRoles = matchingRoles.length > 0 ? true : false;
        }
      }
    }

    if (isCallback(to, options.redirectUri, base) && !authState) {
      try {
        await authService.handleAuthentication();
      } catch (e) {
        router.push(base);
        console.error(e);
      }
    } else if (!authState) {  // we are not authenticated
      if (routeNeedsAuth) {   // the route requires authentication
        authService.login({ target: to.path });
      } else {                // the route DOES NOT require authentication
        next();
      }
    } else { // we are authenticated
      // Does the user have matching roles. Default is true which means that without any roles
      // configured, this should pass the user into the route without issues. However, if the route
      // is configured with the meta.roles tag and DOES NOT have matching roles, then it will
      // not pass the user into the route.
      if(userHasMatchingRoles) {
        next();
      } else {
        router.push('/unauthorized');
      }

    }
  };
};

export default routeGuard;
