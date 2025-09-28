import { PluginSystem } from "./plugin.js";
import { Method, Middleware, RouteHandler, StaticServeOptions } from "./types.js";
export type MiddlewareFn = RouteHandler | Router | PluginSystem;
export declare class Router {
    middlewares: Middleware[];
    addRoute(method: Method, path: string, ...handlers: RouteHandler[]): number;
    use(path?: string | MiddlewareFn, middlewareFn?: MiddlewareFn, method?: Method): this;
    get(path: string, ...handlers: RouteHandler[]): this;
    post(path: string, ...handlers: RouteHandler[]): this;
    put(path: string, ...handlers: RouteHandler[]): this;
    delete(path: string, ...handlers: RouteHandler[]): this;
    all(path: string, ...handlers: RouteHandler[]): this;
    static(apiPath: string, dirPath?: string, opts?: StaticServeOptions): this;
    sse(path: string, ...handlers: RouteHandler[]): this;
    customParser(path: string, handler: RouteHandler, method?: Method): this;
}
