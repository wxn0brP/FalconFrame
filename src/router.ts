import { handleStaticFiles } from "./helpers";
import { Method, Middleware, RouteHandler } from "./types";

export class Router {
    public middlewares: Middleware[] = [];

    addRoute(method: Method, path: string, ...handlers: RouteHandler[]): void {
        const handler = handlers.pop();
        handlers.forEach(middleware => this.use(path, middleware));
        this.middlewares.push({ path, middleware: handler, method });
    }

    use(path: string | RouteHandler | Router = "/", middlewareFn?: RouteHandler | Router, method: Method = "all"): void {
        if (typeof path === "function" || path instanceof Router) {
            middlewareFn = path;
            path = "/";
        }

        const middleware: Middleware = {
            path,
            method,
            middleware: null,
            use: true
        };

        if (middlewareFn instanceof Router) {
            middleware.router = middlewareFn.middlewares;
        } else {
            middleware.middleware = middlewareFn;
        }

        this.middlewares.push(middleware);
    }

    get(path: string, ...handlers: RouteHandler[]): void {
        this.addRoute("get", path, ...handlers);
    }

    post(path: string, ...handlers: RouteHandler[]): void {
        this.addRoute("post", path, ...handlers);
    }

    put(path: string, ...handlers: RouteHandler[]): void {
        this.addRoute("put", path, ...handlers);
    }

    delete(path: string, ...handlers: RouteHandler[]): void {
        this.addRoute("delete", path, ...handlers);
    }

    all(path: string, ...handlers: RouteHandler[]): void {
        this.addRoute("all", path, ...handlers);
    }

    static(apiPath: string, dirPath?: string, utf8 = true): void {
        if (!dirPath) {
            dirPath = apiPath;
            apiPath = "/";
        }
        this.use(apiPath, handleStaticFiles(dirPath, utf8));
    }
}