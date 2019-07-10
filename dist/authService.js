import * as tslib_1 from "tslib";
import { EventEmitter } from "events";
var localStorageKey = "loggedIn";
var isBrowser = typeof window !== "undefined" ? true : false;
var WebAuth;
if (isBrowser) {
    WebAuth = require('auth0-js').WebAuth;
}
else {
    WebAuth = {};
}
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
        if (!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
            return;
        }
        this.auth0.authorize({
            appState: customState
        });
    };
    AuthService.prototype.logOut = function () {
        if (!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
            return;
        }
        localStorage.removeItem(localStorageKey);
        this.idToken = undefined;
        this.expiresIn = 0;
        this.profile = undefined;
        this.auth0.logout({
            returnTo: "" + window.location.origin
        });
    };
    AuthService.prototype.handleAuthentication = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                if (!isBrowser || Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object) {
                    return [2, ('error')];
                }
                return [2, this.auth0.parseHash(function (err, authResult) {
                        if (err) {
                            return (err);
                        }
                        else {
                            if (authResult !== null) {
                                _this.setSession(authResult);
                                if (authResult.idToken) {
                                    return (authResult.idToken);
                                }
                            }
                        }
                    })];
            });
        });
    };
    AuthService.prototype.isAuthenticated = function () {
        if (!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
            return false;
        }
        if (this.expiresIn && (Date.now() < this.expiresIn) && localStorage.getItem(localStorageKey) === "true") {
            return true;
        }
        else {
            return false;
        }
    };
    AuthService.prototype.isIdTokenValid = function () {
        if (!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
            return false;
        }
        if (this.expiresIn && this.idToken && (Date.now() < this.expiresIn)) {
            return true;
        }
        else {
            return false;
        }
    };
    AuthService.prototype.getIdToken = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.idToken && this.isIdTokenValid())) return [3, 1];
                        return [2, (this.idToken)];
                    case 1:
                        if (!this.isAuthenticated()) return [3, 3];
                        return [4, this.renewTokens().then(function (authResult) {
                                return (authResult.idToken);
                            })];
                    case 2: return [2, _a.sent()];
                    case 3: return [2, 'error getting idToken'];
                }
            });
        });
    };
    AuthService.prototype.setSession = function (authResult) {
        if (!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
            return;
        }
        this.idToken = authResult.idToken;
        this.profile = authResult.idTokenPayload;
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
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                if (!isBrowser || (Object.entries(this.auth0).length === 0 && this.auth0.constructor === Object)) {
                    return [2];
                }
                if (localStorage.getItem(localStorageKey) !== "true") {
                    return [2, ("Not logged in")];
                }
                return [2, this.auth0.checkSession({}, function (err, authResult) {
                        if (err) {
                            return (err);
                        }
                        else {
                            _this.setSession(authResult);
                            return (authResult);
                        }
                    })];
            });
        });
    };
    return AuthService;
}(EventEmitter));
export default AuthService;
