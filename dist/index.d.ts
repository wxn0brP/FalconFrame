import { Logger, LoggerOptions } from "@wxn0brp/lucerna-log";
import http from "http";
import { FFResponse } from "./res.js";
import { FFRequest, Method, Middleware, RouteHandler } from "./types.js";
import { renderHTML } from "./render.js";
import { PluginSystem } from "./plugins.js";
export declare class FalconFrame {
    middlewares: Middleware[];
    logger: Logger;
    constructor(loggerOpts?: LoggerOptions);
    addRoute(method: Method, path: string, ...handlers: RouteHandler[]): void;
    use(path?: string | RouteHandler, middleware?: RouteHandler, method?: Method): void;
    get(path: string, ...handlers: RouteHandler[]): void;
    post(path: string, ...handlers: RouteHandler[]): void;
    put(path: string, ...handlers: RouteHandler[]): void;
    delete(path: string, ...handlers: RouteHandler[]): void;
    all(path: string, ...handlers: RouteHandler[]): void;
    static(apiPath: string, dirPath: string): void;
    listen(port: number, callback?: () => void): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    getApp(): (req: any, res: any) => void;
}
export default FalconFrame;
export { FFResponse, FFRequest, RouteHandler, renderHTML, PluginSystem, };
