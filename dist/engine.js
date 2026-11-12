import { getContentType } from "./body-utils.js";
import { createChain } from "./chain.js";
import { parseCookies } from "./helpers.js";
import { safe404, safe500 } from "./safe.js";
import { extractParams, getMiddlewares, matchMiddleware } from "./middleware.js";
import { validate } from "./valid.js";
export class OfflineEngine {
    ff;
    constructor(ff) {
        this.ff = ff;
    }
    async handle(request) {
        const urlParts = request.url.split("?");
        const path = decodeURIComponent(urlParts[0]);
        const query = urlParts[1]
            ? Object.fromEntries(new URLSearchParams(urlParts[1]))
            : {};
        request.method ??= "GET";
        const cookies = request.cookies
            ? {
                ...request.cookies,
                ...parseCookies(request.cookies.cookie || ""),
            }
            : parseCookies(request.headers?.cookie || "");
        const res = {
            statusCode: 200,
            headers: {},
            body: "",
            writableEnded: false,
            FF: this.ff,
            json: (data) => {
                res.headers["content-type"] = "application/json";
                res.body = data;
                res.writableEnded = true;
            },
            send: (data) => {
                res.body = data;
                res.writableEnded = true;
            },
            end: (data) => {
                res.body = data;
                res.writableEnded = true;
            },
            status: (code) => {
                res.statusCode = code;
                return res;
            },
            setHeader: (name, value) => {
                res.headers[name.toLowerCase()] = value;
            },
            ct: (type) => {
                res.headers["content-type"] = type;
                return res;
            },
            cookie: (name, value, opts = {}) => {
                let c = `${name}=${encodeURIComponent(value)}`;
                if (opts.maxAge !== undefined)
                    c += `; Max-Age=${opts.maxAge}`;
                if (opts.path)
                    c += `; Path=${opts.path}`;
                if (opts.httpOnly)
                    c += `; HttpOnly`;
                if (opts.secure)
                    c += `; Secure`;
                const existing = res.headers["set-cookie"];
                res.headers["set-cookie"] = existing ? `${existing}, ${c}` : c;
            },
        };
        const req = {
            path,
            query,
            params: {},
            body: {},
            cookies,
            headers: request.headers || {},
            isBodyParsed: false,
            FF: this.ff,
            header: (name) => request.headers?.[name.toLowerCase()] || "",
            valid: (schema, regexRules) => validate({
                schema,
                data: req.body,
                regexRules,
                isBodyParsed: req.isBodyParsed,
            }),
        };
        if (request.body !== undefined && request.body !== null) {
            const ct = getContentType(req) || "application/json";
            const entry = this.ff.bodyParsers[ct];
            if (entry) {
                const raw = typeof request.body === "string"
                    ? request.body
                    : JSON.stringify(request.body);
                try {
                    req.body = (await entry.parse(raw, req, res)) ?? {};
                    req.isBodyParsed = true;
                }
                catch {
                    req.body = {};
                }
            }
            else {
                req.body = request.body;
                req.isBodyParsed = true;
            }
        }
        const middlewares = getMiddlewares(this.ff.middlewares, path + "/");
        const matched = matchMiddleware(path, middlewares.filter(m => m.method === request.method.toLowerCase() || m.method === "all"));
        if (matched.length === 0) {
            safe404(req, res);
            return this.buildResponse(res);
        }
        const next = createChain(req, res, matched, {
            start(middleware) {
                req.params = extractParams(middleware.path, path);
            },
            result(result) {
                if (typeof result === "string")
                    res.send(result);
                else
                    res.json(result);
            },
            error: (err, middleware) => {
                safe500(err, req, res, middleware);
            },
            exhausted: () => {
                safe404(req, res);
            },
        });
        await next();
        return this.buildResponse(res);
    }
    buildResponse(res) {
        const ct = res.headers["content-type"] || "";
        return {
            status: res.statusCode,
            headers: res.headers,
            body: ct.includes("application/json") && res.body
                ? res.body
                : (res.body ?? ""),
        };
    }
}
