/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-var-requires */

const URI = require('urijs');
// const hash = require('./generate-hash');

const AuthService = require('./authService').default;

const isCallback = (route, cbURL, base) => {
  // console.log('route - ', route)
  // console.log('cbURL - ', cbURL)
  // console.log('base - ', base)

  const cbURI = URI(cbURL);
  const cbPath = cbURI.path();
  const routeFullPath = URI.joinPaths(base, route.path).toString();
  console.log('cbPath - ', cbPath)
  console.log('routeFullPath - ', routeFullPath)

  return cbPath === routeFullPath;
}

const routeGuard = (pluginOptions, base = '/', router) => {
  console.log('pluginOptions - ', pluginOptions)
  const authService = new AuthService(pluginOptions, router);

  // const opts = {
  // //   unauthenticated: (url, redirect) => redirect(url),
  // //   authenticated: (_, next) => next('/'),
  // //   getState: () => {},
  // //   setState: () => {},
  //   ...pluginOptions,
  // };
  // const { redirectUri, clientId } = opts;
  // const unauthURI = URI(opts.url).query({
  //   response_type: 'token',
  //   state: hash(),
  //   redirect_uri: redirectUri,
  //   client_id: clientId,
  // });

  return async (to, from, next) => {
    const authState = await authService.isAuthenticated(); // await opts.getState();
    console.log('authState - ', authState);
    console.log('to - ', to);

    // const redirect = (url) => {
    //   next(false);
    //   window.location.assign(url);
    // };
    // console.log('route guard', opts);

    if (isCallback(to, pluginOptions.redirectUri, base) && !authState) {
      //opts.authenticated(to.fullPath, next);
      try {
        await authService.handleAuthentication();
      } catch (e) {
        router.push(base);
        console.error(e);
      }
    } else if (!authState) {
      // opts.unauthenticated(unauthURI.toString(), redirect);
      authService.login({ target: to.path });
    } else {
      next();
    }

    // if (authState) {
    //   next();
    // }

    // authService.login({ target: to.path });
  };
};

export default routeGuard;
