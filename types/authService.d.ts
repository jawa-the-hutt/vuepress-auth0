/// <reference types="node" />
import { Auth0UserProfile, Auth0DecodedHash } from "auth0-js";
import { EventEmitter } from "events";
declare class AuthService extends EventEmitter {
    idToken?: string;
    profile?: Auth0UserProfile;
    expiresIn?: number;
    login(customState: string): void;
    logOut(): void;
    handleAuthentication(): Promise<string>;
    isAuthenticated(): boolean;
    isIdTokenValid(): boolean;
    getIdToken(): Promise<string>;
    setSession(authResult: any): void;
    renewTokens(): Promise<Auth0DecodedHash>;
}
declare const authService: AuthService;
export default authService;
