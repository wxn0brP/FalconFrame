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
    _400_formatter = (err) => {
        return {
            err: true,
            msg: "Bad request",
            errors: err,
        };
    };
    _404 = (req, res) => {
        res.end("404: File had second thoughts");
    };
    _413 = (req, res) => {
        res.end("413: Cat is too fat");
    };
    _500 = (err, req, res) => {
        res.end("500: The code had an existential crisis");
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
            this.addBodyParser(json({ limit: this.opts.bodyLimit }));
        if (!this.opts.disableUrlencodedParser)
            this.addBodyParser(urlencoded({ limit: this.opts.bodyLimit }));
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
            handleRequest(req, res, this);
        };
    }
    engine(ext, callback) {
        if (ext[0] !== ".")
            ext = "." + ext;
        this.engines[ext] = callback;
        return this;
    }
    setVar(key, value) {
        this.vars[key] = value;
        return this;
    }
    set(key, value) {
        return this.setVar(key, value);
    }
    getVar(key) {
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
    set400Formatter(formatter) {
        this._400_formatter = formatter;
    }
    set404(handler) {
        this._404 = handler;
    }
    set413(handler) {
        this._413 = handler;
    }
    set500(handler) {
        this._500 = handler;
    }
}
export default FalconFrame;
export * as Helpers from "./helpers.js";
export { validateBody } from "./valid.js";
export { FFResponse, renderHTML, Router };
