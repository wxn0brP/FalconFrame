import { Logger, LoggerOptions } from "@wxn0brp/wts-logger";
import http from "http";
import { handleStaticFiles } from "./helpers";
import { handleRequest } from "./req";
import { FFResponse } from "./res";
import { FFRequest, MiddlewareEntry, RouteHandler, Routes } from "./types";

class FalconFrame {
    public routes: Routes = {};
    public middlewares: MiddlewareEntry[] = [];
    public logger: Logger;

    constructor(loggerOpts?: LoggerOptions) {
        this.logger = new Logger({
            loggerName: "falcon-frame",
            ...loggerOpts
        });
        ["get", "post", "put", "delete"].forEach(method => {
            this.routes[method] = [];
        });
    }

    use(path: string | RouteHandler = "/", middleware?: RouteHandler): void {
        if (typeof path === "function") {
            middleware = path;
            path = "/";
        }
        this.middlewares.push({ path, middleware });
    }

    addRoute(method: string, path: string, ...handlers: RouteHandler[]): void {
        const handler = handlers.pop();
        handlers.forEach(middleware => this.use(path, middleware));
        this.routes[method.toLowerCase()]?.push({ path, handler });
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

    static(apiPath: string, dirPath: string): void {
        this.middlewares.push({
            path: apiPath,
            middleware: handleStaticFiles(apiPath, dirPath)
        });
    }

    listen(port: number, callback?: () => void): void {
        const server = http.createServer((req, res) => {
            handleRequest(req as FFRequest, res as FFResponse, this);
        });
        server.listen(port, callback);
    }

    getApp() {
        return (req: any, res: any) => {
            handleRequest(req as FFRequest, res as FFResponse, this);
        }
    }
}

export default FalconFrame;