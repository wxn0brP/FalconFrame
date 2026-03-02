import { Logger } from "@wxn0brp/lucerna-log";
import http from "http";
import { renderHTML } from "./render.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
import type { BeforeHandleRequest, CombinedVars, EngineCallback, ErrorHandler, FFOpts, FFRequest, RouteHandler, ValidationErrorFormatter } from "./types.js";
export declare class FalconFrame<Vars extends Record<string, any> = {}> extends Router {
    logger: Logger;
    bodyParsers: RouteHandler[];
    vars: CombinedVars<Vars>;
    opts: FFOpts;
    engines: Record<string, EngineCallback>;
    _400_formatter: ValidationErrorFormatter;
    _404: RouteHandler;
    _413: RouteHandler;
    _500: ErrorHandler;
    constructor(opts?: Partial<FFOpts>);
    addBodyParser(parser: RouteHandler): this;
    listen(port: number | string, callback?: (() => void) | boolean, beforeHandleRequest?: BeforeHandleRequest): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    getApp(beforeHandleRequest?: BeforeHandleRequest): (req: any, res: any) => Promise<void>;
    engine(ext: string, callback: EngineCallback): this;
    setVar<K extends keyof CombinedVars<Vars>>(key: K, value: CombinedVars<Vars>[K]): this;
    set<K extends keyof CombinedVars<Vars>>(key: K, value: CombinedVars<Vars>[K]): this;
    getVar<K extends keyof CombinedVars<Vars>>(key: K): CombinedVars<Vars>[K];
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
    set400Formatter(formatter: ValidationErrorFormatter): void;
    set404(handler: RouteHandler): void;
    set413(handler: RouteHandler): void;
    set500(handler: ErrorHandler): void;
}
export default FalconFrame;
export * as Helpers from "./helpers.js";
export type { FFOpts as Opts } from "./types.js";
export { validateBody } from "./valid.js";
export { FFRequest, FFResponse, renderHTML, RouteHandler, Router };
