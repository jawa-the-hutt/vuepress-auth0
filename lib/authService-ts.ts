// import { AuthOptions, Auth0Callback, Auth0Error, Auth0UserProfile, Auth0DecodedHash, WebAuth, AuthorizeOptions } from "auth0-js";
// import { EventEmitter } from "events";
// // import authConfig from "../../auth_config.json";



// const auth0: WebAuth = new WebAuth({
//   domain: 'https://auth.dutyfill.com', //  authConfig.domain,
//   redirectUri: `${window.location.origin}/callback`,
//   clientID: 'U35k2mjeNcw2ZXQwxJDT6Hh5hvZdAXBM', // authConfig.clientId,
//   responseType: "id_token",
//   scope: "openid profile email"
// });

// const localStorageKey = "loggedIn";
// const loginEvent = "loginEvent";

// class AuthService extends EventEmitter {
//   idToken?: string;
//   profile?: Auth0UserProfile;
//   expiresIn?: number;

//   login(customState: string): void {
//     auth0.authorize({
//       appState: customState
//     } as AuthorizeOptions);
//   }

//   logOut(): void {
//     localStorage.removeItem(localStorageKey);

//     this.idToken = undefined;
//     this.expiresIn = undefined;
//     this.profile = undefined;

//     auth0.logout({
//       returnTo: `${window.location.origin}`
//     });

//     this.emit(loginEvent, { loggedIn: false });
//   }

//   handleAuthentication(): Promise<string> {
//     return new Promise((resolve, reject) => {
//       auth0.parseHash((err, authResult) => {
//         if (err) {
//           this.emit(loginEvent, {
//             loggedIn: false,
//             error: err,
//             errorMsg: err.statusText
//           });
//           reject(err);
//         } else {
//           if (authResult !== null) {
//             this.setSession(authResult);
//             if (authResult.idToken) {
//               resolve(authResult.idToken);
//             }
//           }
//         }
//       });
//     });
//   }

//   isAuthenticated(): boolean {
//     if ( this.expiresIn && (Date.now() < this.expiresIn) && localStorage.getItem(localStorageKey) === "true") {
//       return true;
//     } else {
//       return false;
//     }
//     // return (
//     //   Date.now() < this.expiresIn &&
//     //   localStorage.getItem(localStorageKey) === "true"
//     // );
//   }

//   isIdTokenValid(): boolean {
//     if ( this.expiresIn && this.idToken && (Date.now() < this.expiresIn)) {
//       return true;
//     } else {
//       return false;
//     }
//     // return this.idToken && this.expiresIn && Date.now() < this.expiresIn;
//   }

//   getIdToken():Promise<string> {
//     return new Promise((resolve, reject) => {
//       if (this.isIdTokenValid()) {
//         resolve(this.idToken);
//       } else if (this.isAuthenticated()) {
//         this.renewTokens().then((authResult) => {
//           resolve(authResult.idToken);
//         }, reject);
//       } else {
//         resolve();
//       }
//     });
//   }

//   setSession(authResult): void {
//     this.idToken = authResult.idToken;
//     this.profile = authResult.idTokenPayload;

//     // Convert the expiry time from seconds to milliseconds,
//     // required by the Date constructor
//     if(this.expiresIn) {
//       this.expiresIn = authResult.expiresIn * 1000 + new Date().getTime();    // new Date(this.profile.exp * 1000);
//     }

//     localStorage.setItem(localStorageKey, "true");

//     this.emit(loginEvent, {
//       loggedIn: true,
//       profile: authResult.idTokenPayload,
//       state: authResult.appState || {}
//     });
//   }

//   renewTokens(): Promise<Auth0DecodedHash> {
//     return new Promise((resolve, reject) => {
//       if (localStorage.getItem(localStorageKey) !== "true") {
//         return reject("Not logged in");
//       }

//       auth0.checkSession({}, (err, authResult) => {
//         if (err) {
//           reject(err);
//         } else {
//           this.setSession(authResult);
//           resolve(authResult);
//         }
//       });
//     });
//   }
// }

// const authService = new AuthService();

// authService.setMaxListeners(5);

// export default authService;
