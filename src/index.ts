import { Logger, LoggerOptions } from "@wxn0brp/lucerna-log";
import http from "http";
import { handleStaticFiles } from "./helpers";
import { handleRequest } from "./req";
import { FFResponse } from "./res";
import { BeforeHandleRequest, FFRequest, Method, RouteHandler } from "./types";
import { renderHTML } from "./render";
import { PluginSystem } from "./plugins";

export class FalconFrame {
    public middlewares: Middleware[] = [];
    public logger: Logger;

    constructor(loggerOpts?: LoggerOptions) {
        this.logger = new Logger({
            loggerName: "falcon-frame",
            ...loggerOpts
        });
    }

    addRoute(method: Method, path: string, ...handlers: RouteHandler[]): void {
        const handler = handlers.pop();
        handlers.forEach(middleware => this.use(path, middleware));
        this.middlewares.push({ path, middleware: handler, method });
    }

    use(path: string | RouteHandler = "/", middleware?: RouteHandler, method: Method = "all"): void {
        if (typeof path === "function") {
            middleware = path;
            path = "/";
        }
        this.middlewares.push({ path, middleware, method, use: true });
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

    static(apiPath: string, dirPath: string): void {
        this.middlewares.push({
            path: (apiPath+"/*").replace("//","/"),
            method: "get",
            middleware: handleStaticFiles(apiPath, dirPath)
        });
        this.middlewares.push({
            path: apiPath,
            method: "get",
            middleware: handleStaticFiles(apiPath, dirPath)
        });
    }

    listen(port: number, callback?: () => void, beforeHandleRequest?: BeforeHandleRequest) {
        const server = http.createServer(this.getApp(beforeHandleRequest));
        server.listen(port, callback);
        return server;
    }

    getApp(beforeHandleRequest?: BeforeHandleRequest) {
        return async (req: any, res: any) => {
            if (beforeHandleRequest) {
                const result = await beforeHandleRequest(req, res);
                if (result || (res as FFResponse)._ended) return;
            }
            await handleRequest(req as FFRequest, res as FFResponse, this);
        }
    }
}

export default FalconFrame;

export {
    FFResponse,
    FFRequest,
    RouteHandler,
    renderHTML,
    PluginSystem,
}