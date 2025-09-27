import { Logger, LoggerOptions } from "@wxn0brp/lucerna-log";
import http from "http";
import { PluginSystem } from "./plugin.js";
import { renderHTML } from "./render.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
import type { BeforeHandleRequest, FFRequest, ParseBodyFunction, RouteHandler } from "./types.js";
export type EngineCallback = (path: string, options: any, callback: (e: any, rendered?: string) => void) => void;
export interface Opts {
    loggerOpts?: LoggerOptions;
    bodyLimit?: string;
}
export declare class FalconFrame<Vars extends Record<string, any> = any> extends Router {
    logger: Logger;
    customParsers: Record<string, ParseBodyFunction>;
    vars: Vars;
    opts: Opts;
    engines: Record<string, EngineCallback>;
    constructor(opts?: Partial<Opts>);
    listen(port: number | string, callback?: (() => void) | boolean, beforeHandleRequest?: BeforeHandleRequest): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    getApp(beforeHandleRequest?: BeforeHandleRequest): (req: any, res: any) => Promise<void>;
    engine(ext: string, callback: EngineCallback): this;
    setVar(key: keyof Vars, value: typeof this.vars[keyof Vars]): void;
    getVar(key: string): typeof this.vars[keyof Vars];
    /**
     * Sets the allowed origins for CORS.
     * This method is a shortcut that simplifies CORS configuration
     * without needing to manually create and register a plugin.
     * @param origin - An array of allowed origins.
     * @example
     * app.setOrigin(["http://example.com", "https://example.com"]);
    */
    setOrigin(origin: string[]): void;
}
export default FalconFrame;
export * as Helpers from "./helpers.js";
export * as PluginsEngine from "./plugin.js";
export { FFRequest, FFResponse, PluginSystem, renderHTML, RouteHandler, Router };
