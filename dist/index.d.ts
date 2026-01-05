import { Logger, LoggerOptions } from "@wxn0brp/lucerna-log";
import http from "http";
import { renderHTML } from "./render.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
import type { BeforeHandleRequest, EngineCallback, FFRequest, RouteHandler } from "./types.js";
export interface Opts {
    loggerOpts?: LoggerOptions;
    bodyLimit?: string;
    disableJsonParser?: boolean;
    disableUrlencodedParser?: boolean;
}
export declare class FalconFrame<Vars extends Record<string, any> = any> extends Router {
    logger: Logger;
    bodyParsers: RouteHandler[];
    vars: Vars;
    opts: Opts;
    engines: Record<string, EngineCallback>;
    _404: RouteHandler;
    constructor(opts?: Partial<Opts>);
    addBodyParser(parser: RouteHandler): this;
    listen(port: number | string, callback?: (() => void) | boolean, beforeHandleRequest?: BeforeHandleRequest): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    getApp(beforeHandleRequest?: BeforeHandleRequest): (req: any, res: any) => Promise<void>;
    engine(ext: string, callback: EngineCallback): this;
    setVar(key: keyof Vars, value: typeof this.vars[keyof Vars]): void;
    set(key: keyof Vars, value: typeof this.vars[keyof Vars]): void;
    getVar(key: string): typeof this.vars[keyof Vars];
    /**
     * Sets the allowed origins for CORS.
     * This method is a shortcut that simplifies CORS configuration
     * without needing to manually create and register a plugin.
     * @param [origin] - An array of allowed origins. (default: ["*"])
     * @example
     * app.setOrigin(["http://example.com", "https://example.com"]);
    */
    setOrigin(origin?: string[] | string): void;
    /**
     * Listens to the specified port, or the environment variable PORT if available.
     * @param port - The port number to listen to.
     * @returns The server object returned by the listen method.
     */
    l(port: number): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    set404(handler: RouteHandler): void;
}
export default FalconFrame;
export * as Helpers from "./helpers.js";
export { FFRequest, FFResponse, renderHTML, RouteHandler, Router };
