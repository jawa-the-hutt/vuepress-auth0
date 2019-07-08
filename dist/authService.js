import * as tslib_1 from "tslib";
import { WebAuth } from "auth0-js";
import { EventEmitter } from "events";
var localStorageKey = "loggedIn";
var AuthService = (function (_super) {
    tslib_1.__extends(AuthService, _super);
    function AuthService(options, router) {
        var _this = _super.call(this) || this;
        _this.auth0 = new WebAuth(tslib_1.__assign({ responseType: 'id_token', scope: 'openid profile email' }, options));
        _this.router = router;
        _this.idToken = undefined;
        _this.profile = undefined;
        _this.expiresIn = 0;
        return _this;
    }
    AuthService.prototype.login = function (customState) {
        this.auth0.authorize({
            appState: customState
        });
    };
    AuthService.prototype.logOut = function () {
        localStorage.removeItem(localStorageKey);
        this.idToken = undefined;
        this.expiresIn = 0;
        this.profile = undefined;
        this.auth0.logout({
            returnTo: "" + window.location.origin
        });
    };
    AuthService.prototype.handleAuthentication = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.auth0.parseHash(function (err, authResult) {
                if (err) {
                    reject(err);
                }
                else {
                    if (authResult !== null) {
                        _this.setSession(authResult);
                        if (authResult.idToken) {
                            resolve(authResult.idToken);
                        }
                    }
                }
            });
        });
    };
    AuthService.prototype.isAuthenticated = function () {
        if (this.expiresIn && (Date.now() < this.expiresIn) && localStorage.getItem(localStorageKey) === "true") {
            return true;
        }
        else {
            return false;
        }
    };
    AuthService.prototype.isIdTokenValid = function () {
        if (this.expiresIn && this.idToken && (Date.now() < this.expiresIn)) {
            return true;
        }
        else {
            return false;
        }
    };
    AuthService.prototype.getIdToken = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.isIdTokenValid()) {
                resolve(_this.idToken);
            }
            else if (_this.isAuthenticated()) {
                _this.renewTokens().then(function (authResult) {
                    resolve(authResult.idToken);
                }, reject);
            }
            else {
                resolve();
            }
        });
    };
    AuthService.prototype.setSession = function (authResult) {
        this.idToken = authResult.idToken;
        this.profile = authResult.idTokenPayload;
        console.log('this.profile - ', this.profile);
        console.log('authResult - ', authResult);
        if (this.profile && this.profile.exp) {
            this.expiresIn = (this.profile.exp * 1000) + Date.now();
            localStorage.setItem(localStorageKey, "true");
            this.router.push(authResult.appState.target);
        }
        else if (authResult.expiresIn) {
            this.expiresIn = authResult.expiresIn * 1000 + Date.now();
            localStorage.setItem(localStorageKey, "true");
            this.router.push(authResult.appState.target);
        }
        else {
        }
    };
    AuthService.prototype.renewTokens = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (localStorage.getItem(localStorageKey) !== "true") {
                return reject("Not logged in");
            }
            _this.auth0.checkSession({}, function (err, authResult) {
                if (err) {
                    reject(err);
                }
                else {
                    _this.setSession(authResult);
                    resolve(authResult);
                }
            });
        });
    };
    return AuthService;
}(EventEmitter));
export default AuthService;
