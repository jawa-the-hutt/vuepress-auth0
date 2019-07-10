import { Auth0UserProfile } from "auth0-js";
import Router from 'vue-router';

export interface pluginOptions {
  domain: string;
  namespace?: string;
  redirectUri: string;
  clientID: string;
  scope?: string;
  responseType?: string;
  allRoutes?: boolean;
  roles?: string[];
  unauthorizedRoute?: string
}

export interface customState {
  target: string;
}

export interface ExtendedAuth0UserProfile extends Auth0UserProfile {
  exp?: number;
  aud?: string;
  iat?: number;
  iss?: string;
  nonce?: string;
}

