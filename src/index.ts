import { Logger, LoggerOptions } from "@wxn0brp/lucerna-log";
import http from "http";
import { PluginSystem } from "./plugin";
import { createCORSPlugin } from "./plugins/cors";
import { renderHTML } from "./render";
import { handleRequest } from "./req";
import { FFResponse } from "./res";
import { Router } from "./router";
import type { BeforeHandleRequest, FFRequest, ParseBodyFunction, RouteHandler } from "./types";

export type EngineCallback = (path: string, options: any, callback: (e: any, rendered?: string) => void) => void;

export interface Opts {
    loggerOpts?: LoggerOptions;
    bodyLimit?: string;
}

export class FalconFrame<Vars extends Record<string, any> = any> extends Router {
    public logger: Logger;
    public customParsers: Record<string, ParseBodyFunction> = {};
    public vars: Vars = {} as Vars;
    public opts: Opts = {};
    public engines: Record<string, EngineCallback> = {};

    constructor(opts: Partial<Opts> = {}) {
        super();
        this.logger = new Logger({
            loggerName: "falcon-frame",
            ...[opts?.loggerOpts || {}],
        });
        this.opts = {
            bodyLimit: "10m",
            ...opts,
        };

        this.engine(".html", (path, options, callback) => {
            try {
                const content = renderHTML(path, options);
                callback(null, content);
            } catch (e) {
                callback(e);
            }
        });
    }

    listen(port: number, callback?: (() => void) | boolean, beforeHandleRequest?: BeforeHandleRequest) {
        const server = http.createServer(this.getApp(beforeHandleRequest));
        if (typeof callback === "boolean") {
            if (callback)
                callback = () => {
                    console.log(`[FF] Server running on http://localhost:${port}`);
                };
            else callback = () => { };
        }
        server.listen(port, callback || (() => { }));
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

    engine(ext: string, callback: EngineCallback) {
        if (ext[0] !== ".") {
            ext = "." + ext;
        }
        this.engines[ext] = callback;
        return this;
    }

    setVar(key: keyof Vars, value: typeof this.vars[keyof Vars]) {
        // @ts-ignore
        this.vars[key] = value;
    }

    getVar(key: string): typeof this.vars[keyof Vars] {
        // @ts-ignore
        return this.vars[key];
    }

    /**
     * Sets the allowed origins for CORS.
     * This method is a shortcut that simplifies CORS configuration
     * without needing to manually create and register a plugin.
     * @param origin - An array of allowed origins.
     * @example
     * app.setOrigin(["http://example.com", "https://example.com"]);
    */
    setOrigin(origin: string[]) {
        this.use(createCORSPlugin(origin).process);
    }
}

export default FalconFrame;

export * as Helpers from "./helpers";
export * as PluginsEngine from "./plugin";
export {
    FFRequest, FFResponse, PluginSystem, renderHTML, RouteHandler, Router
};
