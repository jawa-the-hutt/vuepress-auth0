import VueRouter from 'vue-router';
import { pluginOptions } from './types';
declare const routeGuard: (options: pluginOptions, siteData: any, router: VueRouter) => (to: any, from: any, next: any) => Promise<void>;
export default routeGuard;
