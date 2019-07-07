/* eslint-disable @typescript-eslint/no-var-requires */

//import { WebAuth } from "auth0-js";
// import { EventEmitter } from "events";
// import authConfig from "../../auth_config.json";

const { WebAuth } = require('auth0-js');
const { EventEmitter } = require('events');

const localStorageKey = "loggedIn";
// // const loginEvent = "loginEvent";

export default class AuthService extends EventEmitter {

  constructor(options, router) {
    super();
    this.auth0 = new WebAuth({
      domain: options.domain, //  'geragott.auth0.com', //  authConfig.domain,
      redirectUri: options.redirectUri, //  `${window.location.origin}/callback`,
      clientID: options.clientID, // 'U35k2mjeNcw2ZXQwxJDT6Hh5hvZdAXBM', // authConfig.clientId,
      responseType: "id_token",
      scope: "openid profile email"
    });

    this.router = router;
    this.idToken = null;
    this.profile = null;
    this.expiresIn = null;
  }

  login(customState) {
    this.auth0.authorize({
      appState: customState
    });
  }

  logOut() {
    localStorage.removeItem(localStorageKey);

    this.idToken = null;
    this.expiresIn = null;
    this.profile = null;

    this.auth0.logout({
      returnTo: `${window.location.origin}`
    });

    // // this.emit(loginEvent, { loggedIn: false });
  }

  handleAuthentication() {
    // // console.log('starting handleAuthentication')
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (err) {
          // // this.emit(loginEvent, {
          // //   loggedIn: false,
          // //   error: err,
          // //   errorMsg: err.statusText
          // // });
          // this.logOut();
          reject(err);
        } else {
          if (authResult !== null) {
            // // console.log('authResult - ', authResult)

            this.setSession(authResult);
            if (authResult.idToken) {
              resolve(authResult.idToken);
            }
          }
        }
      });
    });
  }

  isAuthenticated() {
    if ( this.expiresIn && (Date.now() < this.expiresIn) && localStorage.getItem(localStorageKey) === "true") {
      return true;
    } else {
      // this.logOut();
      return false;
    }
    // return (
    //   Date.now() < this.expiresIn &&
    //   localStorage.getItem(localStorageKey) === "true"
    // );
  }

  isIdTokenValid() {
    if ( this.expiresIn && this.idToken && (Date.now() < this.expiresIn)) {
      return true;
    } else {
      // this.logOut();
      return false;
    }
    // return this.idToken && this.expiresIn && Date.now() < this.expiresIn;
  }

  getIdToken() {
    return new Promise((resolve, reject) => {
      if (this.isIdTokenValid()) {
        resolve(this.idToken);
      } else if (this.isAuthenticated()) {
        this.renewTokens().then((authResult) => {
          resolve(authResult.idToken);
        }, reject);
      } else {
        resolve();
      }
    });
  }

  setSession(authResult) {
    // // console.log('starting setSession');

    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;

    // Convert the expiry time from seconds to milliseconds,
    // required by the Date constructor
    this.expiresIn = (this.profile.exp * 1000) + Date.now();  // new Date(this.profile.exp * 1000);

    localStorage.setItem(localStorageKey, "true");
    this.router.push(authResult.appState.target)

    // this.emit(loginEvent, {
    //   loggedIn: true,
    //   profile: authResult.idTokenPayload,
    //   state: authResult.appState || {}
    // });
  }

  renewTokens() {
    return new Promise((resolve, reject) => {
      if (localStorage.getItem(localStorageKey) !== "true") {
        // this.logOut();
        return reject("Not logged in");
      }

      this.auth0.checkSession({}, (err, authResult) => {
        if (err) {
          reject(err);
        } else {
          this.setSession(authResult);
          resolve(authResult);
        }
      });
    });
  }
}

