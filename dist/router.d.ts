import { Method, Middleware, RouteHandler, StaticServeOptions } from "./types.js";
export declare class Router {
    middlewares: Middleware[];
    addRoute(method: Method, path: string, ...handlers: RouteHandler[]): number;
    use(path?: string | RouteHandler | Router, middlewareFn?: RouteHandler | Router, method?: Method): this;
    get(path: string, ...handlers: RouteHandler[]): this;
    post(path: string, ...handlers: RouteHandler[]): this;
    put(path: string, ...handlers: RouteHandler[]): this;
    delete(path: string, ...handlers: RouteHandler[]): this;
    all(path: string, ...handlers: RouteHandler[]): this;
    static(apiPath: string, dirPath?: string, opts?: StaticServeOptions): this;
    sse(path: string, ...handlers: RouteHandler[]): this;
}
