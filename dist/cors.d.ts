import { RouteHandler } from "./types.js";
export interface Opts {
    accessControlAllowMethods?: boolean;
    accessControlAllowHeaders?: boolean;
    headers?: Record<string, string>;
}
export declare function createCORS(allowedOrigins: string[], opts?: Opts): RouteHandler;
