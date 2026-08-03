import { randomUUID } from "crypto";
import { URL } from "url";
import { getContentType, getRawBody } from "./body-utils.js";
import { getIP, parseCookies } from "./helpers.js";
import { getMiddlewares, matchMiddleware } from "./middleware.js";
import { FFResponse } from "./res.js";
import { validate } from "./valid.js";
export function handleRequest(req, res, FF, reRoute = false) {
    if (!reRoute) {
        Object.setPrototypeOf(res, FFResponse.prototype);
        req.FF = FF;
        res.FF = FF;
        const originalEnd = res.end;
        res.end = (...any) => {
            res._ended = true;
            return originalEnd.call(res, ...any);
        };
    }
    const { logger } = FF;
    try {
        const [path, params] = (req.url || "").split("?");
        const normalizedPath = path.replace(/\/{2,}/g, "/");
        const parsedUrl = new URL(normalizedPath + (params ? `?${params}` : ""), "http://localhost");
        req.path = decodeURIComponent(parsedUrl.pathname) || "/";
        req.query = Object.fromEntries(parsedUrl.searchParams);
    }
    catch (e) {
        logger.error(`Error parsing URL (${req.url}): ${e}`);
        res.status(400).end("400: Bad request");
        return;
    }
    req.cookies = parseCookies(req.headers.cookie || "");
    req.ip = getIP(req);
    req.params = {};
    req.valid = (schema, regexRules) => validate({
        schema,
        data: req.body,
        regexRules,
        isBodyParsed: req.isBodyParsed,
    });
    req.reRoute = fn => {
        fn(req);
        handleRequest(req, res, FF, true);
    };
    req.header = (name) => req.headers[name.toLowerCase()] || "";
    req.isBodyParsed = false;
    if (FF.opts.xRequestId !== "disable") {
        if (req.headers["x-request-id"]) {
            req.id = req.headers["x-request-id"];
            res.setHeader("x-request-id", req.id);
        }
        else if (FF.opts.xRequestId === "auto") {
            req.id = randomUUID();
            res.setHeader("x-request-id", req.id);
        }
    }
    logger.info(`Incoming request: ${req.method} ${req.url}` +
        (req.id ? ` [${req.id}]` : ""));
    const middlewaresPath = req.path + "/";
    const middlewares = getMiddlewares(FF.middlewares, middlewaresPath.replace(/\/+/g, "/"));
    const matchedTypeMiddlewares = middlewares.filter(middleware => middleware.method === req.method.toLowerCase() ||
        middleware.method === "all");
    const matchedMiddlewares = matchMiddleware(req.path, matchedTypeMiddlewares);
    logger.debug("Matched middlewares: " +
        matchedMiddlewares.map(middleware => middleware.path).join(", "));
    if (matchedMiddlewares.length === 0) {
        res.status(404);
        FF._404(req, res);
        return;
    }
    let middlewareIndex = 0;
    async function next() {
        if (middlewareIndex >= matchedMiddlewares.length) {
            res.status(404);
            FF._404(req, res);
            return;
        }
        const middleware = matchedMiddlewares[middlewareIndex++];
        logger.debug(`Executing middleware ${middlewareIndex} of ${matchedMiddlewares.length} matched for path [${middleware.path}]`);
        if (middleware.path.includes(":")) {
            const middlewareParts = middleware.path.split("/");
            const reqPathParts = req.path.split("/");
            req.params = {};
            for (let i = 0; i < middlewareParts.length; i++) {
                if (middlewareParts[i].startsWith(":")) {
                    const paramName = middlewareParts[i].slice(1);
                    req.params[paramName] = reqPathParts[i];
                }
            }
        }
        req.middleware = middleware;
        try {
            const result = await middleware.middleware(req, res, next);
            if (result && !res._ended) {
                if (typeof result === "string") {
                    return res.end(result);
                }
                else if (typeof result === "object") {
                    if (result instanceof FFResponse)
                        return res.end();
                    return res.json(result);
                }
            }
        }
        catch (err) {
            logger.error(`Unhandled error in middleware for path [${middleware.path}]:`, err.stack || err);
            if (!res.headersSent && !res.writableEnded) {
                res.status(500);
                FF._500(err, req, res);
            }
        }
    }
    const hasCustomParserEndpoint = matchedMiddlewares.some(middleware => middleware.customParser);
    if (hasCustomParserEndpoint) {
        logger.debug("Executing custom parser endpoint");
        req.body = {};
        next();
        return;
    }
    if (req.method === "GET" ||
        req.method === "HEAD" ||
        req.method === "OPTIONS") {
        logger.debug("Method does not require body. Executing middlewares");
        req.body = {};
        next();
        return;
    }
    if (reRoute) {
        logger.debug("Re-route. Executing middlewares");
        next();
        return;
    }
    req.body = {};
    const ct = getContentType(req) || "application/json";
    const entry = FF.bodyParsers[ct];
    if (!entry) {
        logger.debug("No body parser found for content-type. Executing middlewares");
        next();
        return;
    }
    logger.debug(`Executing body parser for content-type: ${ct}`);
    getRawBody(req, res, entry.limit)
        .then(async (rawBody) => {
        try {
            req.body = (await entry.parse(rawBody, req, res)) ?? {};
            req.isBodyParsed = true;
        }
        catch (err) {
            if (!res._ended)
                req.body = {};
        }
        next();
    })
        .catch(() => {
        if (!res._ended)
            req.body = {};
        next();
    });
}
