import { Logger } from "@wxn0brp/lucerna-log";
import http from "http";
import { PluginSystem } from "./plugin.js";
import { createCORSPlugin } from "./plugins/cors.js";
import { renderHTML } from "./render.js";
import { handleRequest } from "./req.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
export class FalconFrame extends Router {
    logger;
    customParsers = {};
    vars = {};
    opts = {};
    engines = {};
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
        this.engine(".html", (path, options, callback) => {
            try {
                const content = renderHTML(path, options);
                callback(null, content);
            }
            catch (e) {
                callback(e);
            }
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
    engine(ext, callback) {
        if (ext[0] !== ".") {
            ext = "." + ext;
        }
        this.engines[ext] = callback;
        return this;
    }
    setVar(key, value) {
        // @ts-ignore
        this.vars[key] = value;
    }
    getVar(key) {
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
    setOrigin(origin) {
        this.use(createCORSPlugin(origin).process);
    }
}
export default FalconFrame;
export * as Helpers from "./helpers.js";
export * as PluginsEngine from "./plugin.js";
export { FFResponse, PluginSystem, renderHTML, Router };
