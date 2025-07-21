import { Logger } from "@wxn0brp/lucerna-log";
import http from "http";
import { PluginSystem } from "./plugins.js";
import { renderHTML } from "./render.js";
import { handleRequest } from "./req.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
import { FFRequest } from "./types.js";
export class FalconFrame extends Router {
    logger;
    constructor(loggerOpts) {
        super();
        this.logger = new Logger({
            loggerName: "falcon-frame",
            ...loggerOpts
        });
    }
    listen(port, callback, beforeHandleRequest) {
        const server = http.createServer(this.getApp(beforeHandleRequest));
        if (typeof callback === "boolean") {
            if (callback)
                callback = () => {
                    console.log(`[FF] Server running on http://localhost:${port}`);
                };
            else
                callback = () => { };
        }
        server.listen(port, callback || (() => { }));
        return server;
    }
    getApp(beforeHandleRequest) {
        return async (req, res) => {
            if (beforeHandleRequest) {
                const result = await beforeHandleRequest(req, res);
                if (result || res._ended)
                    return;
            }
            await handleRequest(req, res, this);
        };
    }
}
export default FalconFrame;
export { FFRequest, FFResponse, PluginSystem, renderHTML, Router };
export * as Plugins from "./plugins/index.js";
export * as PluginsEngine from "./plugins.js";
export * as Helpers from "./helpers.js";
