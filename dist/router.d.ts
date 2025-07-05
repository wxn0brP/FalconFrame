import { Method, Middleware, RouteHandler } from "./types.js";
export declare class Router {
    middlewares: Middleware[];
    addRoute(method: Method, path: string, ...handlers: RouteHandler[]): void;
    use(path?: string | RouteHandler | Router, middlewareFn?: RouteHandler | Router, method?: Method): void;
    get(path: string, ...handlers: RouteHandler[]): void;
    post(path: string, ...handlers: RouteHandler[]): void;
    put(path: string, ...handlers: RouteHandler[]): void;
    delete(path: string, ...handlers: RouteHandler[]): void;
    all(path: string, ...handlers: RouteHandler[]): void;
    static(apiPath: string, dirPath?: string, utf8?: boolean): void;
}
