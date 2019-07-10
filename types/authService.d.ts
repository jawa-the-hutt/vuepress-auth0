/// <reference types="node" />
import { Auth0DecodedHash } from "auth0-js";
import { EventEmitter } from "events";
import { pluginOptions, customState, ExtendedAuth0UserProfile } from './types';
import VueRouter from 'vue-router';
export default class AuthService extends EventEmitter {
    private auth0;
    private router;
    private idToken;
    profile: ExtendedAuth0UserProfile | undefined;
    private expiresIn;
    constructor(options: pluginOptions, router: VueRouter);
    login(customState: customState): void;
    logOut(): void;
    handleAuthentication(): Promise<string>;
    isAuthenticated(): boolean;
    isIdTokenValid(): boolean;
    getIdToken(): Promise<string>;
    setSession(authResult: Auth0DecodedHash): void;
    renewTokens(): Promise<any>;
}
