import { Logger } from "@wxn0brp/lucerna-log";
import http from "http";
import { json, urlencoded } from "./body.js";
import { createCORS } from "./cors.js";
import { renderHTML } from "./render.js";
import { handleRequest } from "./req.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
export class FalconFrame extends Router {
    logger;
    bodyParsers = [];
    vars = {};
    opts = {};
    engines = {};
    _404 = (req, res) => {
        res.end("404: File had second thoughts");
    };
    constructor(opts = {}) {
        super();
        const loggerOpts = opts?.loggerOpts || {};
        this.logger = new Logger({
            loggerName: "falcon-frame",
            ...loggerOpts,
        });
        this.opts = {
            bodyLimit: "10m",
            ...opts,
        };
        if (!this.opts.disableJsonParser)
            this.addBodyParser(json(this, { limit: this.opts.bodyLimit }));
        if (!this.opts.disableUrlencodedParser)
            this.addBodyParser(urlencoded(this, { limit: this.opts.bodyLimit }));
        this.engine(".html", (path, options, callback, FF) => {
            try {
                const content = renderHTML(path, options, [], FF);
                callback(null, content);
            }
            catch (e) {
                callback(e);
            }
        });
    }
    addBodyParser(parser) {
        this.bodyParsers.push(parser);
        return this;
    }
    listen(port, callback, beforeHandleRequest) {
        const server = http.createServer(this.getApp(beforeHandleRequest));
        let parsedPort = 0;
        let host = "";
        if (typeof port === "string") {
            if (port.includes(":")) {
                const [h, po] = port.split(":");
                host = h;
                parsedPort = +po;
            }
            else
                parsedPort = +port;
        }
        else if (typeof port === "number") {
            parsedPort = port;
        }
        if (typeof callback === "boolean") {
            if (callback)
                callback = () => {
                    console.log(`[FF] Server running on http://${host || "localhost"}:${parsedPort}`);
                };
            else
                callback = () => { };
        }
        const cb = callback || (() => { });
        server.listen(parsedPort, host || "0.0.0.0", cb);
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
        if (ext[0] !== ".")
            ext = "." + ext;
        this.engines[ext] = callback;
        return this;
    }
    setVar(key, value) {
        // @ts-ignore
        this.vars[key] = value;
    }
    set(key, value) {
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
     * @param [origin] - An array of allowed origins. (default: ["*"])
     * @example
     * app.setOrigin(["http://example.com", "https://example.com"]);
    */
    setOrigin(origin = "*") {
        this.use(createCORS(Array.isArray(origin) ? origin : [origin]));
    }
    /**
     * Listens to the specified port, or the environment variable PORT if available.
     * @param port - The port number to listen to.
     * @returns The server object returned by the listen method.
     */
    l(port) {
        return this.listen(+process.env.PORT || port, true);
    }
    set404(handler) {
        this._404 = handler;
    }
}
export default FalconFrame;
export * as Helpers from "./helpers.js";
export { FFResponse, renderHTML, Router };
