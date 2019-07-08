/* eslint-disable @typescript-eslint/no-var-requires */


import { Auth0DecodedHash, WebAuth, AuthorizeOptions } from "auth0-js";
import { EventEmitter } from "events";
import { pluginOptions, customState, ExtendedAuth0UserProfile } from './types';
import VueRouter from 'vue-router';

const localStorageKey: string = "loggedIn";
// // // const loginEvent = "loginEvent";

export default class AuthService extends EventEmitter {

  private auth0: WebAuth;
  private router;
  private idToken!: string | undefined;
  public profile!: ExtendedAuth0UserProfile | undefined;
  private expiresIn!: number;
  // // private namespace!: string;

  constructor(options: pluginOptions, router: VueRouter) {
    super();
    this.auth0 = new WebAuth({
      responseType: 'id_token',
      scope: 'openid profile email',
      ...options
    });

    this.router = router;
    this.idToken = undefined;
    this.profile = undefined;
    this.expiresIn = 0;
    // // this.namespace = options.namespace | undefined;
  }

  login(customState: customState): void {
    this.auth0.authorize({
      appState: customState
    } as AuthorizeOptions);
  }

  logOut(): void {
    localStorage.removeItem(localStorageKey);

    this.idToken = undefined;
    this.expiresIn = 0;
    this.profile = undefined;

    this.auth0.logout({
      returnTo: `${window.location.origin}`
    });

    // // this.emit(loginEvent, { loggedIn: false });
  }

  handleAuthentication(): Promise<string> {
    return new Promise((resolve, reject) => {
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

  isAuthenticated(): boolean {
    if ( this.expiresIn && (Date.now() < this.expiresIn) && localStorage.getItem(localStorageKey) === "true") {
      return true;
    } else {
      // this.logOut();
      return false;
    }
  }

  isIdTokenValid(): boolean {
    if ( this.expiresIn && this.idToken && (Date.now() < this.expiresIn)) {
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
    // // console.log('starting setSession');

    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;
    console.log('this.profile - ', this.profile);
    console.log('authResult - ', authResult);

    // Convert the expiry time from seconds to milliseconds,
    // required by the Date constructor
    if(this.profile && this.profile.exp ) {
      this.expiresIn = (this.profile.exp * 1000) + Date.now();  // new Date(this.profile.exp * 1000);
      localStorage.setItem(localStorageKey, "true");
      this.router.push(authResult.appState.target)
    } else if (authResult.expiresIn) {
        // this.expiresIn = (this.profile.exp * 1000) + Date.now();  // new Date(this.profile.exp * 1000);
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
      if (localStorage.getItem(localStorageKey) !== "true") {
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
