import { Plugin } from "../plugin.js";
interface Opts {
    accessControlAllowMethods?: boolean;
    accessControlAllowHeaders?: boolean;
    headers?: Record<string, string>;
}
export declare function createCORSPlugin(allowedOrigins: string[], opts?: Opts): Plugin;
export {};
