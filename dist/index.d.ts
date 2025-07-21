import { Logger, LoggerOptions } from "@wxn0brp/lucerna-log";
import http from "http";
import { PluginSystem } from "./plugins.js";
import { renderHTML } from "./render.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
import { BeforeHandleRequest, FFRequest, RouteHandler } from "./types.js";
export declare class FalconFrame extends Router {
    logger: Logger;
    constructor(loggerOpts?: LoggerOptions);
    listen(port: number, callback?: (() => void) | boolean, beforeHandleRequest?: BeforeHandleRequest): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    getApp(beforeHandleRequest?: BeforeHandleRequest): (req: any, res: any) => Promise<void>;
}
export default FalconFrame;
export { FFRequest, FFResponse, PluginSystem, renderHTML, RouteHandler, Router };
export * as Plugins from "./plugins/index.js";
export * as PluginsEngine from "./plugins.js";
export * as Helpers from "./helpers.js";
