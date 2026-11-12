import { Middleware } from "./types.js";
export declare function matchMiddleware(url: string, middlewares: Middleware[]): Middleware[];
export declare function getMiddlewares(middlewares: Middleware[], matchUrl: string, basePath?: string): Middleware[];
export declare function extractParams(routePath: string, requestPath: string): Record<string, string>;
