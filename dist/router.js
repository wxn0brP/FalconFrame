import { handleStaticFiles } from "./helpers.js";
import { PluginSystem } from "./plugin.js";
import { SSEManager } from "./sse.js";
export class Router {
    middlewares = [];
    addRoute(method, path, ...handlers) {
        const handler = handlers.pop();
        handlers.forEach((middleware) => this.use(path, middleware));
        return this.middlewares.push({ path, middleware: handler, method });
    }
    use(path = "/", middlewareFn, method = "all") {
        if (typeof path === "function" || path instanceof Router || path instanceof PluginSystem) {
            middlewareFn = path;
            path = "/";
        }
        const middleware = {
            path,
            method,
            middleware: null,
            use: true,
        };
        if (middlewareFn instanceof Router) {
            middleware.router = middlewareFn.middlewares;
        }
        else if (middlewareFn instanceof PluginSystem) {
            middleware.middleware = middlewareFn.getRouteHandler();
        }
        else {
            middleware.middleware = middlewareFn;
        }
        this.middlewares.push(middleware);
        return this;
    }
    get(path, ...handlers) {
        this.addRoute("get", path, ...handlers);
        return this;
    }
    post(path, ...handlers) {
        this.addRoute("post", path, ...handlers);
        return this;
    }
    put(path, ...handlers) {
        this.addRoute("put", path, ...handlers);
        return this;
    }
    delete(path, ...handlers) {
        this.addRoute("delete", path, ...handlers);
        return this;
    }
    all(path, ...handlers) {
        this.addRoute("all", path, ...handlers);
        return this;
    }
    static(apiPath, dirPath, opts = {}) {
        if (!dirPath) {
            dirPath = apiPath;
            apiPath = "/";
        }
        this.use(apiPath, handleStaticFiles(dirPath, opts));
        return this;
    }
    sse(path, ...handlers) {
        const lastHandler = handlers.pop() || (() => { });
        const manager = new SSEManager();
        handlers.push(manager.getMiddleware(lastHandler));
        this.addRoute("get", path, ...handlers);
        return manager;
    }
    customParser(path, handler, method = "post") {
        const index = this.addRoute(method, path, handler);
        this.middlewares[index - 1].customParser = true;
        return this;
    }
}
