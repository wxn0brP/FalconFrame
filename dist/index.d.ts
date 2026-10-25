import { Logger } from "@wxn0brp/lucerna-log";
import http from "http";
import { type ResolvedConfig } from "./config.js";
import { renderHTML } from "./render.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
import type { BeforeHandleRequest, BodyParserEntry, CombinedVars, DebugOptions, EngineCallback, ErrorHandler, FFOpts, FFRequest, FinalHandler, ParseBodyFunction, RouteHandler, StandardBodyParserOptions, ValidationErrorFormatter } from "./types.js";
export declare class FalconFrame<Vars extends Record<string, any> = {}> extends Router {
    logger: Logger;
    bodyParsers: Record<string, BodyParserEntry>;
    vars: CombinedVars<Vars>;
    opts: FFOpts;
    config: ResolvedConfig;
    engines: Record<string, EngineCallback>;
    _debug?: {
        path: string;
        pass: string;
        generated: boolean;
        enabled?: boolean;
    };
    _400_formatter: ValidationErrorFormatter;
    _404: FinalHandler;
    _413: FinalHandler;
    _408: FinalHandler;
    _500: ErrorHandler;
    constructor(opts?: Partial<FFOpts>);
    addBodyParser(contentType: string, parser: ParseBodyFunction, opts?: StandardBodyParserOptions): this;
    listen(port: number | string, callback?: (() => void) | boolean, beforeHandleRequest?: BeforeHandleRequest): http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    /**
     * Mount the debug panel. Without an explicit `pass` a random token is
     * generated and printed together with the URL on `listen()`.
     */
    debug(opts?: DebugOptions): this;
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
    set404(handler: FinalHandler): void;
    set413(handler: FinalHandler): void;
    set408(handler: FinalHandler): void;
    set500(handler: ErrorHandler): void;
}
export default FalconFrame;
export { OfflineEngine } from "./engine.js";
export type { OfflineRequest, OfflineResponse } from "./engine.js";
export * as Helpers from "./helpers.js";
export { compression, compressionMiddleware } from "./compress.js";
export { createDebug, generateDebugToken } from "./debug.js";
export type { DebugOptions } from "./debug.js";
export type { FFOpts as Opts, ProxyMode, CompressionOptions } from "./types.js";
export { validateBody } from "./valid.js";
export { FFRequest, FFResponse, FinalHandler, renderHTML, RouteHandler, Router, };
