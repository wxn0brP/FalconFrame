import { Logger } from "@wxn0brp/lucerna-log";
import http from "http";
import { PluginSystem } from "./plugins.js";
import { renderHTML } from "./render.js";
import { handleRequest } from "./req.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
export class FalconFrame extends Router {
    logger;
    customParsers = {};
    vars = {};
    opts = {};
    constructor(opts = {}) {
        super();
        this.logger = new Logger({
            loggerName: "falcon-frame",
            ...[opts?.loggerOpts || {}],
        });
        this.opts = {
            bodyLimit: "10m",
            ...opts,
        };
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
    setVar(key, value) {
        // @ts-ignore
        this.vars[key] = value;
    }
    getVar(key) {
        // @ts-ignore
        return this.vars[key];
    }
}
export default FalconFrame;
export { FFResponse, PluginSystem, renderHTML, Router };
export * as Plugins from "./plugins/index.js";
export * as PluginsEngine from "./plugins.js";
export * as Helpers from "./helpers.js";
