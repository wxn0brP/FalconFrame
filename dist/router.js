import { handleStaticFiles } from "./helpers.js";
export class Router {
    middlewares = [];
    addRoute(method, path, ...handlers) {
        const handler = handlers.pop();
        handlers.forEach(middleware => this.use(path, middleware));
        return this.middlewares.push({ path, middleware: handler, method });
    }
    use(path = "/", middlewareFn, method = "all") {
        if (typeof path === "function" || path instanceof Router) {
            middlewareFn = path;
            path = "/";
        }
        const middleware = {
            path,
            method,
            middleware: null,
            use: true
        };
        if (middlewareFn instanceof Router) {
            middleware.router = middlewareFn.middlewares;
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
    static(apiPath, dirPath, utf8 = true) {
        if (!dirPath) {
            dirPath = apiPath;
            apiPath = "/";
        }
        this.use(apiPath, handleStaticFiles(dirPath, utf8));
        return this;
    }
    sse(path, ...handlers) {
        const index = this.addRoute("get", path, ...handlers);
        this.middlewares[index - 1].sse = true;
        return this;
    }
}
