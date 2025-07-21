import { Logger, LoggerOptions } from "@wxn0brp/lucerna-log";
import http from "http";
import { PluginSystem } from "./plugins";
import { renderHTML } from "./render";
import { handleRequest } from "./req";
import { FFResponse } from "./res";
import { Router } from "./router";
import { BeforeHandleRequest, FFRequest, RouteHandler } from "./types";

export class FalconFrame extends Router {
    public logger: Logger;

    constructor(loggerOpts?: LoggerOptions) {
        super();
        this.logger = new Logger({
            loggerName: "falcon-frame",
            ...loggerOpts
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
        server.listen(port, callback || (() => {}));
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
}

export default FalconFrame;

export {
    FFRequest, FFResponse, PluginSystem, renderHTML, RouteHandler, Router
};
export * as Plugins from "./plugins/index";
export * as PluginsEngine from "./plugins.js";
export * as Helpers from "./helpers";
