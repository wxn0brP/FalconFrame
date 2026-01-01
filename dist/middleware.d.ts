import { Middleware } from "./types.js";
export declare function matchMiddleware(url: string, middlewares: Middleware[]): Middleware[];
export declare function getMiddlewares(middlewares: Middleware[], matchUrl: string, basePath?: string): Middleware[];
