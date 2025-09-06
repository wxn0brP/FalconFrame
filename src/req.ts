import { URL } from "url";
import FalconFrame from ".";
import { parseCookies } from "./helpers";
import { FFResponse } from "./res";
import { FFRequest } from "./types";
import { validate } from "./valid";
import { getMiddlewares, matchMiddleware } from "./middleware";
import { parseBody } from "./body";

export function handleRequest(req: FFRequest, res: FFResponse, FF: FalconFrame): void {
    Object.setPrototypeOf(res, FFResponse.prototype);
    const originalEnd = res.end;
    res.end = function (...any: any[]) {
        res._ended = true;
        return originalEnd.call(res, ...any);
    }

    const { logger } = FF;
    try {
        const [path, params] = (req.url || "").split("?");
        const normalizedPath = path.replace(/\/{2,}/g, "/");
        const parsedUrl = new URL(normalizedPath + (params ? `?${params}` : ""), "http://localhost");
        req.path = decodeURIComponent(parsedUrl.pathname) || "/";
        req.query = Object.fromEntries(parsedUrl.searchParams);
    } catch (e) {
        logger.error(`Error parsing URL (${req.url}): ${e}`);
        res.status(400).end("400: Bad request");
        return;
    }

    req.cookies = parseCookies(req.headers.cookie || "");
    req.params = {};
    req.valid = (schema: any) => validate(schema, req.body);

    logger.info(`Incoming request: ${req.method} ${req.url}`);

    const middlewaresPath = req.path + "/";
    const middlewares = getMiddlewares(FF.middlewares, middlewaresPath.replace(/\/+/g, "/"));

    const matchedTypeMiddlewares = middlewares.filter(middleware => middleware.method === req.method.toLowerCase() || middleware.method === "all");
    const matchedMiddlewares = matchMiddleware(req.path, matchedTypeMiddlewares);
    logger.debug("Matched middlewares: " + matchedMiddlewares.map(middleware => middleware.path).join(", "));

    if (matchedMiddlewares.length === 0) {
        res.status(404).end("404: File had second thoughts");
        return;
    }

    let middlewareIndex = 0;
    async function next() {
        if (middlewareIndex >= matchedMiddlewares.length) {
            return res.status(404).end("404: File had second thoughts");
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
        const result = await middleware.middleware(req, res, next);
        if (result && !res._ended) {
            if (typeof result === "string") {
                return res.end(result);
            } else if (typeof result === "object") {
                if (result instanceof FFResponse) return res.end();
                return res.json(result);
            }
        }
    }

    if (req.method === "GET" && middlewares[middlewares.length - 1]?.sse) {
        next();
        return;
    }

    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", async () => {
        const parsedBody = await parseBody(req, body, FF);
        Object.assign(req, parsedBody);
        logger.debug(`Request body: ${JSON.stringify(req.body)}`);

        next();
    });
}