/* eslint-disable @typescript-eslint/no-var-requires */

import { Auth0DecodedHash, AuthorizeOptions } from "auth0-js";
import { EventEmitter } from "events";
import { pluginOptions, customState, ExtendedAuth0UserProfile } from './types';
import VueRouter from 'vue-router';

const localStorageKey: string = "loggedIn";
// // // // const loginEvent = "loginEvent";

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

  private auth0;
  private router;
  private idToken!: string | undefined;
  public profile!: ExtendedAuth0UserProfile | undefined;
  private expiresIn!: number;

  constructor(options: pluginOptions, router: VueRouter) {
    super();

    this.auth0 = new WebAuth({
      responseType: 'id_token',
      scope: 'openid profile email',
      ...options
    })

    this.router = router;
    this.idToken = undefined;
    this.profile = undefined;
    this.expiresIn = 0;
  }

  login(customState: customState): void {
    if(!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
      return;
    }

    this.auth0.authorize({
      appState: customState
    } as AuthorizeOptions);
  }

  logOut(): void {
    if(!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
      return;
    }

    localStorage.removeItem(localStorageKey);
    this.idToken = undefined;
    this.expiresIn = 0;
    this.profile = undefined;

    this.auth0.logout({
      returnTo: `${window.location.origin}`
    });

    // // this.emit(loginEvent, { loggedIn: false });
  }

  async handleAuthentication(): Promise<string> {
      if(!isBrowser || Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object) {
        return('error');
      }

      return this.auth0.parseHash((err, authResult) => {
        if (err) {
          // // this.emit(loginEvent, {
          // //   loggedIn: false,
          // //   error: err,
          // //   errorMsg: err.statusText
          // // });
          return(err);
        } else {
          if (authResult !== null) {
            this.setSession(authResult);
            if (authResult.idToken) {
              return(authResult.idToken);
            }
          }
        }
      });
  }

  isAuthenticated(): boolean {
    if(!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
      return false;
    }

    if (this.expiresIn && (Date.now() < this.expiresIn) && localStorage.getItem(localStorageKey) === "true") {
      return true;
    } else {
      return false;
    }
  }

  isIdTokenValid(): boolean {
    if(!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
      return false;
    }

    if (this.expiresIn && this.idToken && (Date.now() < this.expiresIn)) {
      return true;
    } else {
      return false;
    }
  }

  async getIdToken(): Promise<string> {
      if (this.idToken && this.isIdTokenValid()) {
        return(this.idToken);
      } else if (this.isAuthenticated()) {
        return await this.renewTokens().then((authResult: any) => {
          return(authResult.idToken);
        });
      } else {
        return 'error getting idToken';
      }
  }

  setSession(authResult: Auth0DecodedHash): void {
    if(!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
      return;
    }

    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;

    // Convert the expiry time from seconds to milliseconds,
    // required by the Date constructor
    if(this.profile && this.profile.exp ) {
      this.expiresIn = (this.profile.exp * 1000) + Date.now();
      localStorage.setItem(localStorageKey, "true");
      this.router.push(authResult.appState.target)
    } else if (authResult.expiresIn) {
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

  async renewTokens(): Promise<any> {
    if(!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
      return;
    }

    if (localStorage.getItem(localStorageKey) !== "true") {
      return ("Not logged in");
    }

    return this.auth0.checkSession({}, (err, authResult) => {
      if (err) {
        return(err);
      } else {
        this.setSession(authResult);
        return(authResult);
      }
    });
  }
}
