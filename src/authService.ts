/* eslint-disable @typescript-eslint/no-var-requires */
import { Auth0DecodedHash, AuthorizeOptions } from "auth0-js";
import { EventEmitter } from "events";
import { pluginOptions, customState, ExtendedAuth0UserProfile } from './types';
import VueRouter from 'vue-router';

const localStorageKey: string = "loggedIn";
// // // const loginEvent = "loginEvent";
const isBrowser = typeof window !== "undefined" ? true : false;
let WebAuth;

// only import WebAuth if we're in a browser
// The reason for this is some build systems will error
// out with 'window is not defined' if we don't make
// sure we're in a browser first.
if(isBrowser) {
  WebAuth = require('auth0-js').WebAuth;
} else  {
  WebAuth = {};
}

export default class AuthService extends EventEmitter {

  private auth0; // WebAuth | {};
  private router;
  private idToken!: string | undefined;
  public profile!: ExtendedAuth0UserProfile | undefined;
  private expiresIn!: number;

  constructor(options: pluginOptions, router: VueRouter) {
    super();

    this.auth0 = // isBrowser ?
    new WebAuth({
      responseType: 'id_token',
      scope: 'openid profile email',
      ...options
    }) // : {};

    this.router = router;
    this.idToken = undefined;
    this.profile = undefined;
    this.expiresIn = 0;
  }

  login(customState: customState): void {
    if(this.auth0 instanceof WebAuth) {
      this.auth0.authorize({
        appState: customState
      } as AuthorizeOptions);
    }
  }

  logOut(): void {
    if(isBrowser) {
      localStorage.removeItem(localStorageKey);
    }

    this.idToken = undefined;
    this.expiresIn = 0;
    this.profile = undefined;

    if(this.auth0 instanceof WebAuth) {
      this.auth0.logout({
        returnTo: `${window.location.origin}`
      });
    }

    // // this.emit(loginEvent, { loggedIn: false });
  }

  handleAuthentication(): Promise<string> {
    return new Promise((resolve, reject) => {
      if(this.auth0 instanceof WebAuth) {
        this.auth0.parseHash((err, authResult) => {
          if (err) {
            // // this.emit(loginEvent, {
            // //   loggedIn: false,
            // //   error: err,
            // //   errorMsg: err.statusText
            // // });
            reject(err);
          } else {
            if (authResult !== null) {
              this.setSession(authResult);
              if (authResult.idToken) {
                resolve(authResult.idToken);
              }
            }
          }
        });
      }
    });
  }

  isAuthenticated(): boolean {

    if ( isBrowser && this.expiresIn && (Date.now() < this.expiresIn) && localStorage.getItem(localStorageKey) === "true") {
      return true;
    } else {
      // this.logOut();
      return false;
    }
  }

  isIdTokenValid(): boolean {
    if ( isBrowser && this.expiresIn && this.idToken && (Date.now() < this.expiresIn)) {
      return true;
    } else {
      return false;
    }
  }

  getIdToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.isIdTokenValid()) {
        resolve(this.idToken);
      } else if (this.isAuthenticated()) {
        this.renewTokens().then((authResult: any) => {
          resolve(authResult.idToken);
        }, reject);
      } else {
        resolve();
      }
    });
  }

  setSession(authResult: Auth0DecodedHash): void {
    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;

    // Convert the expiry time from seconds to milliseconds,
    // required by the Date constructor
    if(isBrowser && this.profile && this.profile.exp ) {
      this.expiresIn = (this.profile.exp * 1000) + Date.now();  // new Date(this.profile.exp * 1000);
      localStorage.setItem(localStorageKey, "true");
      this.router.push(authResult.appState.target)
    } else if (isBrowser && authResult.expiresIn) {
      this.expiresIn = authResult.expiresIn * 1000 + Date.now();
      localStorage.setItem(localStorageKey, "true");
      this.router.push(authResult.appState.target)
    } else {

    }
    // this.emit(loginEvent, {
    //   loggedIn: true,
    //   profile: authResult.idTokenPayload,
    //   state: authResult.appState || {}
    // });
  }

  renewTokens() {
    return new Promise((resolve, reject) => {
      if (isBrowser && localStorage.getItem(localStorageKey) !== "true") {
        return reject("Not logged in");
      }

      if(this.auth0 instanceof WebAuth) {
        this.auth0.checkSession({}, (err, authResult) => {
          if (err) {
            reject(err);
          } else {
            this.setSession(authResult);
            resolve(authResult);
          }
        });
      }
    });
  }
}
