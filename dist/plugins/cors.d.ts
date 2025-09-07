import { Plugin } from "../plugins.js";
interface Opts {
    accessControlAllowMethods?: boolean;
    accessControlAllowHeaders?: boolean;
}
export declare function createCORSPlugin(allowedOrigins: string[], opts?: Opts): Plugin;
export {};
