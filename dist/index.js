import { Logger } from "@wxn0brp/lucerna-log";
import http from "http";
import * as bodyParser from "./body.js";
import { parseLimit } from "./body-utils.js";
import { createCORS } from "./cors.js";
import { renderHTML } from "./render.js";
import { handleRequest } from "./req.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
export class FalconFrame extends Router {
    logger;
    bodyParsers = {};
    vars = {};
    opts = {};
    engines = {};
    _400_formatter = err => {
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
        const dp = this.opts.disableParser || {};
        const isBun = !!globalThis.Bun;
        const bunOnly = new Set([
            "json5",
            "yaml",
            "toml",
        ]);
        const parsers = {
            json: {
                fn: bodyParser.json,
                ct: "application/json",
            },
            urlencoded: {
                fn: bodyParser.urlencoded,
                ct: "application/x-www-form-urlencoded",
            },
            json5: {
                fn: bodyParser.json5,
                ct: "application/json5",
            },
            yaml: {
                fn: bodyParser.yaml,
                ct: "application/yaml",
            },
            toml: {
                fn: bodyParser.toml,
                ct: "application/toml",
            },
            xml: {
                fn: bodyParser.xml,
                ct: "application/xml",
            },
            text: {
                fn: bodyParser.text,
                ct: "text/plain",
            },
        };
        for (const [key, { fn, ct }] of Object.entries(parsers)) {
            if (dp[key])
                continue;
            if (bunOnly.has(key) && !isBun)
                continue;
            this.addBodyParser(ct, fn);
        }
        this.engine(".html", (path, data, callback, FF) => {
            try {
                const content = renderHTML({
                    templatePath: path,
                    data,
                    FF,
                });
                callback(null, content);
            }
            catch (e) {
                callback(e);
            }
        });
    }
    addBodyParser(contentType, parser, opts = {}) {
        this.bodyParsers[contentType] = {
            parse: parser,
            limit: parseLimit(opts.limit || this.opts.bodyLimit || "10m"),
        };
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
        this.use(createCORS(Array.isArray(origin)
            ? origin
            : [
                origin,
            ]));
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
