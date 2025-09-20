import { Logger, LoggerOptions } from "@wxn0brp/lucerna-log";
import http from "http";
import { PluginSystem } from "./plugins.js";
import { renderHTML } from "./render.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
import type { BeforeHandleRequest, FFRequest, ParseBodyFunction, RouteHandler } from "./types.js";
export interface Opts {
    loggerOpts?: LoggerOptions;
    bodyLimit?: string;
}
export declare class FalconFrame<Vars extends Record<string, any> = any> extends Router {
    logger: Logger;
    customParsers: Record<string, ParseBodyFunction>;
    vars: Vars;
    opts: Opts;
    constructor(opts?: Partial<Opts>);
    listen(port: number, callback?: (() => void) | boolean, beforeHandleRequest?: BeforeHandleRequest): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    getApp(beforeHandleRequest?: BeforeHandleRequest): (req: any, res: any) => Promise<void>;
    setVar(key: keyof Vars, value: typeof this.vars[keyof Vars]): void;
    getVar(key: string): typeof this.vars[keyof Vars];
}
export default FalconFrame;
export { FFRequest, FFResponse, PluginSystem, renderHTML, Router, RouteHandler };
export * as Plugins from "./plugins/index.js";
export * as PluginsEngine from "./plugins.js";
export * as Helpers from "./helpers.js";
