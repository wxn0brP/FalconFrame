import { Logger } from "@wxn0brp/lucerna-log";
import http from "http";
import * as bodyParser from "./body.js";
import { parseLimit } from "./body-utils.js";
import { resolveConfig, isDebugEnabled } from "./config.js";
import { createCORS } from "./cors.js";
import { createDebug, generateDebugToken } from "./debug.js";
import { renderHTML } from "./render.js";
import { handleRequest } from "./req.js";
import { FFResponse } from "./res.js";
import { Router } from "./router.js";
export class FalconFrame extends Router {
    logger;
    bodyParsers = {};
    vars = {};
    opts = {};
    config;
    engines = {};
    _debug;
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
    _408 = (req, res) => {
        res.end("408: The request took a nap");
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
        this.config = resolveConfig(this.opts);
        const dp = this.config.disableParser || {};
        const isBun = !!globalThis.Bun;
        const bunOnly = new Set([
            "json5",
            "yaml",
            "toml",
        ]);
        const untrusted = new Set([
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
            text: {
                fn: bodyParser.text,
                ct: "text/plain",
            },
        };
        for (const [key, { fn, ct }] of Object.entries(parsers)) {
            if (dp[key])
                continue;
            if (untrusted.has(key) && !this.config.untrustedBodyParsers)
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
            limit: opts.limit !== undefined
                ? parseLimit(opts.limit)
                : this.config.bodyLimit,
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
        let printUrl = false;
        if (typeof callback === "boolean") {
            printUrl = callback;
            callback = () => { };
        }
        const cb = callback || (() => { });
        server.listen(parsedPort, host || "0.0.0.0", () => {
            const address = server.address();
            const actualPort = address && typeof address === "object" ? address.port : parsedPort;
            if (printUrl) {
                console.log(`[FF] Server running on http://${host || "localhost"}:${actualPort}`);
            }
            if (this._debug && isDebugEnabled(this._debug.enabled)) {
                const urlHost = host && host !== "0.0.0.0" && host !== "::" ? host : "localhost";
                const token = this._debug.generated ? `?pass=${this._debug.pass}` : "";
                console.log(`[FF] Debug panel: http://${urlHost}:${actualPort}${this._debug.path}${token}`);
            }
            cb();
        });
        return server;
    }
    /**
     * Mount the debug panel. Without an explicit `pass` a random token is
     * generated and printed together with the URL on `listen()`.
     */
    debug(opts = {}) {
        const resolved = this.config.debug;
        const path = opts.path ?? opts.url ?? resolved.path;
        const explicitPass = opts.pass ?? resolved.pass ?? process.env.FF_DEBUG_PASS;
        const pass = explicitPass ?? generateDebugToken();
        const enabled = opts.enabled ?? resolved.enabled;
        this._debug = {
            path,
            pass,
            generated: !explicitPass,
            enabled,
        };
        this.use(createDebug({
            ...opts,
            path,
            pass,
        }, resolved));
        return this;
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
    set408(handler) {
        this._408 = handler;
    }
    set500(handler) {
        this._500 = handler;
    }
}
export default FalconFrame;
export { OfflineEngine } from "./engine.js";
export * as Helpers from "./helpers.js";
export { compression, compressionMiddleware } from "./compress.js";
export { createDebug, generateDebugToken } from "./debug.js";
export { validateBody } from "./valid.js";
export { FFResponse, renderHTML, Router, };
