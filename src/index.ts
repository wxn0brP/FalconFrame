import { Logger, LoggerOptions } from "@wxn0brp/wts-logger";
import http from "http";
import { handleStaticFiles } from "./helpers";
import { handleRequest } from "./req";
import { FFResponse } from "./res";
import { FFRequest, Middleware, RequestHandler, Routes } from "./types";

class FalconFrame {
    public routes: Routes = {};
    public middlewares: Middleware[] = [];
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

    use(middleware: Middleware): void {
        this.middlewares.push(middleware);
    }

    addRoute(method: string, path: string, handler: RequestHandler): void {
        this.routes[method.toLowerCase()]?.push({ path, handler });
    }

    get(path: string, handler: RequestHandler): void {
        this.addRoute("get", path, handler);
    }

    post(path: string, handler: RequestHandler): void {
        this.addRoute("post", path, handler);
    }

    put(path: string, handler: RequestHandler): void {
        this.addRoute("put", path, handler);
    }

    delete(path: string, handler: RequestHandler): void {
        this.addRoute("delete", path, handler);
    }

    static(apiPath: string, dirPath: string): void {
        this.middlewares.push(handleStaticFiles(apiPath, dirPath));
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